import { promises as fs } from "node:fs";
import path from "node:path";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProblemDetailView } from "@/components/problem-detail-view";
import problemsData from "@/data/problems.json";
import type { ProblemDetail, ProblemListItem } from "@/types";

const problems = problemsData as unknown as ProblemListItem[];

export const dynamicParams = false;

export function generateStaticParams() {
  return problems.map((p) => ({ slug: p.slug }));
}

async function getDetail(slug: string): Promise<ProblemDetail | null> {
  try {
    const file = path.join(
      process.cwd(),
      "src",
      "data",
      "questions",
      `${slug}.json`,
    );
    return JSON.parse(await fs.readFile(file, "utf8")) as ProblemDetail;
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const detail = await getDetail(slug);
  if (!detail) return {};
  return {
    title: detail.title,
    description: `Taro 75 #${detail.rank} · ${detail.title} — approach, time & space complexity, and reference solutions in multiple languages.`,
  };
}

export default async function QuestionPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const detail = await getDetail(slug);
  if (!detail) notFound();
  return <ProblemDetailView detail={detail} />;
}
