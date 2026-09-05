import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../common/prisma/prisma.service';
import OpenAI from 'openai';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private openai: OpenAI;
  private readonly model: string;

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');
    this.model = this.configService.get<string>('OPENAI_MODEL', 'gpt-4o');

    if (apiKey) {
      this.openai = new OpenAI({ apiKey });
    } else {
      this.logger.warn('OPENAI_API_KEY not set — AI features will return mock responses');
    }
  }

  async generateCoverLetter(userId: string, applicationId: string, additionalContext?: string) {
    const application = await this.getApplication(userId, applicationId);
    const defaultResume = await this.getDefaultResume(userId);

    const prompt = `You are an expert career coach and professional writer. Generate a compelling, personalized cover letter for the following job application.

Company: ${application.company}
Job Title: ${application.jobTitle}
Location: ${application.location || 'Not specified'}
Salary Range: ${application.salary || 'Not specified'}
Job Description: ${application.jobDescription || 'Not provided'}
Notes: ${application.notes || 'None'}
${additionalContext ? `Additional Context: ${additionalContext}` : ''}
${defaultResume?.parsedText ? `Candidate's Resume Summary:\n${defaultResume.parsedText.substring(0, 2000)}` : ''}

Write a professional, enthusiastic, and tailored cover letter (3-4 paragraphs). 
- Start with a strong opening that mentions the specific role and company
- Highlight relevant experience and skills
- Show enthusiasm for the company's mission  
- End with a clear call to action
- Keep it under 400 words`;

    const content = await this.callAI(prompt);

    // Save the cover letter
    const coverLetter = await this.prisma.coverLetter.create({
      data: {
        userId,
        title: `Cover Letter - ${application.company} - ${application.jobTitle}`,
        content,
        applicationId,
      },
    });

    // Log the generation
    await this.logGeneration(userId, applicationId, 'cover_letter', prompt, content);

    return coverLetter;
  }

  async calculateMatchScore(userId: string, applicationId: string, resumeId: string) {
    const application = await this.getApplication(userId, applicationId);

    const resume = await this.prisma.resume.findFirst({
      where: { id: resumeId, userId },
    });

    if (!resume) {
      throw new NotFoundException('Resume not found');
    }

    if (!application.jobDescription && !application.jobTitle) {
      throw new BadRequestException('Application must have a job description for matching');
    }

    const prompt = `You are an expert ATS (Applicant Tracking System) and technical recruiter. Analyze the match between this resume and job application.

Job Title: ${application.jobTitle}
Company: ${application.company}
Job Description: ${application.jobDescription || `Position: ${application.jobTitle} at ${application.company}`}

Resume Content:
${resume.parsedText || 'Resume text not available - analyze based on available information'}

Provide a detailed analysis in the following JSON format only (no markdown, no extra text):
{
  "score": <number 0-100>,
  "matchedSkills": [<list of skills found in both resume and job>],
  "missingSkills": [<list of required skills not found in resume>],
  "suggestions": [<list of 3-5 actionable improvement suggestions>],
  "summary": "<brief 2-3 sentence assessment>"
}`;

    const content = await this.callAI(prompt);

    let result;
    try {
      result = JSON.parse(content);
    } catch {
      // Fallback if JSON parsing fails
      result = {
        score: 65,
        matchedSkills: ['Based on analysis'],
        missingSkills: ['Unable to parse structured response'],
        suggestions: ['Please ensure job description is detailed for better analysis'],
        summary: content,
      };
    }

    // Update application with match score
    await this.prisma.jobApplication.update({
      where: { id: applicationId },
      data: { matchScore: result.score },
    });

    await this.logGeneration(userId, applicationId, 'match_score', prompt, JSON.stringify(result));

    return result;
  }

  async generateInterviewQuestions(userId: string, applicationId: string, questionCount = 10) {
    const application = await this.getApplication(userId, applicationId);

    const prompt = `You are an expert interviewer at top tech companies. Generate ${questionCount} targeted interview questions for this position.

Company: ${application.company}
Job Title: ${application.jobTitle}
Job Description: ${application.jobDescription || `${application.jobTitle} at ${application.company}`}

Generate questions in the following JSON format only (no markdown, no extra text):
{
  "questions": [
    {
      "category": "<Technical|Behavioral|Situational|Company-Specific>",
      "question": "<the interview question>",
      "tips": "<brief tip on how to answer this question>",
      "difficulty": "<Easy|Medium|Hard>"
    }
  ]
}

Include a mix of: technical skills questions, behavioral (STAR method), system design (if applicable), cultural fit, and role-specific questions.`;

    const content = await this.callAI(prompt);

    let result;
    try {
      result = JSON.parse(content);
    } catch {
      result = {
        questions: [{ category: 'General', question: content, tips: '', difficulty: 'Medium' }],
      };
    }

    // Save interview prep
    const interviewPrep = await this.prisma.interviewPrep.create({
      data: {
        userId,
        applicationId,
        questions: result.questions,
      },
    });

    await this.logGeneration(userId, applicationId, 'interview_questions', prompt, content);

    return { ...interviewPrep, questions: result.questions };
  }

  async summarizeJobDescription(userId: string, jobDescription: string) {
    const prompt = `You are a career advisor. Analyze and summarize this job description concisely.

Job Description:
${jobDescription}

Provide a summary in the following JSON format only (no markdown, no extra text):
{
  "summary": "<2-3 sentence overview of the role>",
  "keyRequirements": [<5-8 most important requirements>],
  "niceToHave": [<2-4 nice-to-have qualifications>],
  "companyCulture": "<brief insight about company culture if mentioned>",
  "roleType": "<Remote|On-site|Hybrid|Not specified>",
  "seniorityLevel": "<Junior|Mid-level|Senior|Lead|Manager|Executive>",
  "technicalStack": [<technologies/tools mentioned>]
}`;

    const content = await this.callAI(prompt);

    let result;
    try {
      result = JSON.parse(content);
    } catch {
      result = { summary: content };
    }

    await this.logGeneration(userId, null, 'job_summary', prompt, content);

    return result;
  }

  async suggestResumeImprovements(userId: string, applicationId: string) {
    const application = await this.getApplication(userId, applicationId);
    const defaultResume = await this.getDefaultResume(userId);

    const prompt = `You are an expert resume consultant. Analyze this resume against the job requirements and provide specific improvements.

Job Title: ${application.jobTitle}
Company: ${application.company}  
Job Description: ${application.jobDescription || application.jobTitle}

Resume Content:
${defaultResume?.parsedText || 'No resume uploaded yet'}

Provide suggestions in the following JSON format only:
{
  "overallScore": <number 0-100>,
  "improvements": [
    {
      "section": "<Summary|Experience|Skills|Education|etc>",
      "issue": "<what needs improvement>",
      "suggestion": "<specific actionable fix>",
      "priority": "<High|Medium|Low>"
    }
  ],
  "keywordsToAdd": [<keywords from job description missing in resume>],
  "strengthsToHighlight": [<existing strengths to emphasize more>]
}`;

    const content = await this.callAI(prompt);

    let result;
    try {
      result = JSON.parse(content);
    } catch {
      result = { overallScore: 0, improvements: [], keywordsToAdd: [], strengthsToHighlight: [] };
    }

    await this.logGeneration(userId, applicationId, 'resume_improvements', prompt, content);

    return result;
  }

  private async callAI(prompt: string): Promise<string> {
    if (!this.openai) {
      return this.getMockResponse(prompt);
    }

    try {
      const response = await this.openai.chat.completions.create({
        model: this.model,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 2000,
      });

      return response.choices[0]?.message?.content || '';
    } catch (error) {
      this.logger.error('OpenAI API call failed', error);
      return this.getMockResponse(prompt);
    }
  }

  private getMockResponse(prompt: string): string {
    if (prompt.includes('cover letter')) {
      return `Dear Hiring Manager,

I am writing to express my strong interest in the position at your company. With my background in software development and passion for building impactful products, I believe I would be an excellent addition to your team.

Throughout my career, I have demonstrated the ability to deliver high-quality solutions while collaborating effectively with cross-functional teams. My experience aligns well with the requirements outlined in your job description, and I am excited about the opportunity to contribute to your organization's continued success.

I would welcome the opportunity to discuss how my skills and experience can benefit your team. Thank you for considering my application.

Best regards,
[Your Name]`;
    }

    if (prompt.includes('match') || prompt.includes('score')) {
      return JSON.stringify({
        score: 78,
        matchedSkills: ['JavaScript', 'TypeScript', 'React', 'Node.js', 'PostgreSQL'],
        missingSkills: ['GraphQL', 'Kubernetes', 'Go'],
        suggestions: [
          'Add GraphQL experience or show willingness to learn',
          'Highlight any containerization experience with Docker',
          'Quantify your impact with metrics in bullet points',
          'Add a strong technical summary at the top of your resume',
        ],
        summary: 'Strong candidate with solid full-stack experience. Missing some DevOps skills mentioned in the JD.',
      });
    }

    if (prompt.includes('interview')) {
      return JSON.stringify({
        questions: [
          { category: 'Technical', question: 'Describe your experience with TypeScript and how you handle type safety in large codebases.', tips: 'Give concrete examples from past projects', difficulty: 'Medium' },
          { category: 'Behavioral', question: 'Tell me about a time you had to meet a tight deadline. How did you handle it?', tips: 'Use the STAR method', difficulty: 'Easy' },
          { category: 'Technical', question: 'How would you design a scalable REST API for a high-traffic application?', tips: 'Discuss caching, pagination, rate limiting', difficulty: 'Hard' },
          { category: 'Situational', question: 'What would you do if you discovered a critical bug in production right before a major release?', tips: 'Show your decision-making process', difficulty: 'Medium' },
          { category: 'Company-Specific', question: 'Why are you interested in working at this company specifically?', tips: 'Research the company beforehand', difficulty: 'Easy' },
        ],
      });
    }

    return JSON.stringify({
      summary: 'This is a software engineering role requiring strong technical skills.',
      keyRequirements: ['5+ years experience', 'TypeScript', 'React', 'Node.js', 'PostgreSQL'],
      niceToHave: ['GraphQL', 'AWS', 'Docker'],
      companyCulture: 'Fast-paced startup environment',
      roleType: 'Remote',
      seniorityLevel: 'Senior',
      technicalStack: ['TypeScript', 'React', 'Node.js', 'PostgreSQL'],
    });
  }

  private async getApplication(userId: string, applicationId: string) {
    const application = await this.prisma.jobApplication.findFirst({
      where: { id: applicationId, userId },
    });

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    return application;
  }

  private async getDefaultResume(userId: string) {
    return this.prisma.resume.findFirst({
      where: { userId, isDefault: true },
    });
  }

  private async logGeneration(
    userId: string,
    applicationId: string | null,
    type: string,
    prompt: string,
    result: string,
  ) {
    await this.prisma.aiGeneration.create({
      data: {
        userId,
        applicationId,
        type,
        prompt: prompt.substring(0, 5000),
        result: result.substring(0, 10000),
        model: this.model,
      },
    });
  }
}
