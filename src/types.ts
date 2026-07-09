export type Difficulty = "easy" | "medium" | "hard";
export type Confidence = "shaky" | "good" | "solid";

export interface ProblemListItem {
  id: string;
  rank: number;
  title: string;
  slug: string;
  difficulty: Difficulty;
  topics: string[];
  preview: string;
  companies: string[];
  companyCount: number;
  hasBruteForce: boolean;
  hasOptimal: boolean;
}

export interface CompanyFacet {
  slug: string;
  name: string;
  logo: string | null;
  count: number;
}

export interface TopicFacet {
  name: string;
  count: number;
}

export interface CompanyRef {
  slug: string;
  name: string;
  logo: string | null;
}

export interface Example {
  input: string;
  output: string;
  explanation: string;
}

export interface EdgeCase {
  edgeCase: string;
  handling: string;
}

export interface BigO {
  runtimeValue: string;
  runtimeExplanation: string;
  spaceValue: string;
  spaceExplanation: string;
}

export interface CodeBlock {
  code: string;
  html: string;
}

export interface Solution {
  overview: string;
  steps: string[];
  bigO: BigO;
  languages: string[];
  code: Record<string, CodeBlock>;
}

export interface ProblemDetail {
  id: string;
  slug: string;
  rank: number;
  title: string;
  difficulty: Difficulty;
  topics: string[];
  externalUrl: string | null;
  numViews: number | null;
  questionBody: string;
  plainEnglishBody: string;
  examples: Example[];
  clarifyingQuestions: string[];
  edgeCases: EdgeCase[];
  companies: CompanyRef[];
  solutions: {
    bruteForce: Solution | null;
    optimal: Solution | null;
  };
}

export interface Meta {
  total: number;
  difficulty: Record<string, number>;
  topicCount: number;
  companyCount: number;
  source: string;
  generatedAt: string;
}
