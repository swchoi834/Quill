"use client";

import PdfRenderer from "@/components/PdfRenderer";
import { trpc } from "@/app/_trpc/client";

interface PageProps {
  params: {
    fileid: string;
  };
}

const Page = ({ params }: PageProps) => {
  const { fileid: fileId } = params;

  const { data: url, isLoading } = trpc.getSignedUrl.useQuery({ id: fileId });

  if (isLoading) return <div>Loading...</div>;

  if (!url && !isLoading) return <div>File not found</div>;

  // const plan = await getUserSubscriptionPlan();

  return (
    <div className="flex-1 justify-between flex flex-col h-[calc(100vh-3.5rem)]">
      <div className="mx-auto w-full max-w-8xl grow lg:flex xl:px-2">
        {/* Left sidebar & main wrapper */}
        <div className="flex-1 xl:flex">
          <div className="px-4 py-6 sm:px-6 lg:pl-8 xl:flex-1 xl:pl-6">
            {/* Main area */}
            <PdfRenderer url={url} />
          </div>
        </div>

        <div className="shrink-0 flex-[0.75] border-t border-gray-200 lg:w-96 lg:border-l lg:border-t-0">
          {/* <ChatWrapper isSubscribed={plan.isSubscribed} fileId={file.id} /> */}
        </div>
      </div>
    </div>
  );
};

export default Page;
