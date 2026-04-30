import type { Audit, Params, Response, Status } from './common';

export type Test = { id: string } & Partial<{
  title: string;
  code: string;
  status: Status;
  sections: TestSection[];
  auditMetadata?: Audit;
}>;

export type GetTestParams = Params & Partial<{ status: Status }>;

export type GetTestsResponse = Response<Test[]>;

export type CreateTestPayload = Partial<{
  title: string;
  code: string;
}>;

export type EditTestPayload = CreateTestPayload & {
  id: string;
};

export type TestDetail = {
  testId: string;
  testSections: TestSection[];
};

export enum QuestionType {
  SINGLE_ANSWER = 'SINGLE_ANSWER',
  MULTIPLE_ANSWER = 'MULTIPLE_ANSWER',
  YNN_ANSWER = 'YNN_ANSWER',
  MATCHING_PARAGRAPH = 'MATCHING_PARAGRAPH',
  NOTE_COMPLETION_WITH_HINT = 'NOTE_COMPLETION_WITH_HINT',
  NOTE_COMPLETION_NO_HINT = 'NOTE_COMPLETION_NO_HINT',
  DIAGRAM_LABEL_COMPLETION = 'DIAGRAM_LABEL_COMPLETION',
  TFN_ANSWER = 'TFN_ANSWER',
}

export type QuestionGroup = {
  id: string;
  guideline: string;
} & (
  | {
      questions: QuestionWithOptions[];
      questionType:
        | QuestionType.SINGLE_ANSWER
        | QuestionType.YNN_ANSWER
        | QuestionType.MULTIPLE_ANSWER
        | QuestionType.TFN_ANSWER;
    }
  | {
      questions: MatchingParagraphQuestion[];
      questionType: QuestionType.MATCHING_PARAGRAPH;
    }
  | {
      questions: NoteCompletionQuestion[];
      questionType:
        | QuestionType.NOTE_COMPLETION_WITH_HINT
        | QuestionType.NOTE_COMPLETION_NO_HINT;
    }
  | {
      questions: DiagramLabelCompletionQuestion[];
      questionType: QuestionType.DIAGRAM_LABEL_COMPLETION;
    }
);

export type BaseQuestion = {
  uuid: string;
  type: QuestionType;
};

export type Option = {
  key: number;
  value: string;
};

// Specific question variants
export type QuestionWithOptions = BaseQuestion & {
  content: {
    question: string;
    options: Option[];
  };
  maxSelectedOptions?: number;
};

export type MatchingParagraphQuestion = BaseQuestion & {
  options: Option[];
  maxSelectedOptions?: number;
};

export type NoteCompletionQuestion = BaseQuestion & {
  heading: string;
  options?: Option[];
  paragraph: {
    id: string;
    editorValue: string;
    blanks: { id: string; key: number }[];
  };
};

export enum ParagraphType {
  REGULAR = 'REGULAR',
  ANNOTATE = 'ANNOTATE',
}

export enum MarkedBy {
  ALPHABET = 'ALPHABET',
  NUMBER = 'NUMBER',
}

export type DiagramLabelCompletionQuestion = BaseQuestion & {
  nodeBlanks: {
    blanks: {
      blankId: string;
      blankIndex: number;
      range: number[];
    }[];
    heading?: string;
    editorValue: string;
  }[];
};

export type Question =
  | QuestionWithOptions // SINGLE_ANSWER, MULTIPLE_ANSWER, YNN_ANSWER, TFN_ANSWER
  | MatchingParagraphQuestion // MATCHING_PARAGRAPH
  | NoteCompletionQuestion // NOTE_COMPLETION_WITH_HINT | NOTE_COMPLETION_NO_HINT
  | DiagramLabelCompletionQuestion; // DIAGRAM_LABEL_COMPLETION

export type Paragraph = {
  id: string;
  content: string;
};

export type Passage = {
  id?: string;
  title?: string;
  type?: ParagraphType;
  subtitle?: string;
  paragraphs?: Paragraph[];
  markedBy?: string;
  totalParagraphs?: number;
  totalQuestions?: number;
};

export type TestSection = {
  id: string;
  questionGroups: QuestionGroup[];
  passage?: Passage;
  testId?: string;
  passageId?: string | null;
  order?: number;
  auditMetadata?: Audit;
};

export type GetTestSectionParams = Params &
  Partial<{
    testId: string;
    passageId: string;
  }>;

export type GetTestSectionsResponse = Response<TestSection[]>;

export type CreateTestSectionPayload = {
  testId: string;
  passageId?: string | null;
};

export type EditTestSectionPayload = Partial<CreateTestSectionPayload> & {
  id: string;
};

// Question Group API Types
export type GetQuestionGroupParams = Params &
  Partial<{
    testSectionId: string;
    questionType: QuestionType;
  }>;

export type GetQuestionGroupsResponse = Response<QuestionGroup[]>;

export type CreateQuestionPayload = {
  uuid: string;
  questionType: QuestionType;
  order: number;
  content: Record<string, any>;
  questionNumber?: number;
};

export type CreateQuestionGroupPayload = {
  testSectionId: string;
  questionType: QuestionType;
  guideline: string;
  questions?: CreateQuestionPayload[];
};

export type EditQuestionGroupPayload = Partial<CreateQuestionGroupPayload> & {
  id: string;
};
