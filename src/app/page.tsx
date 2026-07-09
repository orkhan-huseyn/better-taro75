import { ProblemExplorer } from "@/components/problem-explorer";
import companiesData from "@/data/companies.json";
import metaData from "@/data/meta.json";
import problemsData from "@/data/problems.json";
import topicsData from "@/data/topics.json";
import type {
  CompanyFacet,
  Meta,
  ProblemListItem,
  TopicFacet,
} from "@/types";

const problems = problemsData as unknown as ProblemListItem[];
const companies = companiesData as unknown as CompanyFacet[];
const topics = topicsData as unknown as TopicFacet[];
const meta = metaData as unknown as Meta;

export default function HomePage() {
  return (
    <ProblemExplorer
      problems={problems}
      companies={companies}
      topics={topics}
      total={meta.total}
    />
  );
}
