import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getReport, getAllSlugs } from "@/lib/reports";
import ReportView from "@/components/reports/ReportView";
import { Card } from "@/components/ui/Card";

export function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const r = getReport(slug);
  return { title: r ? `${r.title} · BoxTech` : "Report · BoxTech" };
}

export default async function ReportPage({ params }) {
  const { slug } = await params;
  const report = getReport(slug);

  if (!report) {
    return (
      <Card className="mx-auto max-w-md p-8 text-center">
        <h1 className="text-[15px] font-semibold text-ink">Report not found</h1>
        <p className="mt-1 text-[13px] text-ink-soft">
          That report isn&apos;t in the catalogue.
        </p>
        <Link
          href="/reports"
          className="mt-4 inline-block text-[13px] font-semibold text-brand hover:underline"
        >
          Back to all reports
        </Link>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Link
        href="/reports"
        className="press inline-flex items-center gap-1.5 text-[12px] font-medium text-ink-soft transition-colors hover:text-ink"
      >
        <ArrowLeft className="size-3.5" />
        All reports
      </Link>
      <ReportView report={report} />
    </div>
  );
}
