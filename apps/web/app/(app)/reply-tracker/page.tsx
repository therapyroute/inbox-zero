import { redirect } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircleIcon, ClockIcon, MailIcon } from "lucide-react";
import { NeedsReply } from "./NeedsReply";
import { Resolved } from "@/app/(app)/reply-tracker/Resolved";
import { AwaitingReply } from "@/app/(app)/reply-tracker/AwaitingReply";
import { auth } from "@/app/api/auth/[...nextauth]/auth";
import prisma from "@/utils/prisma";
import { EnableReplyTracker } from "@/app/(app)/reply-tracker/EnableReplyTracker";
import { TimeRangeFilter } from "./TimeRangeFilter";
import type { TimeRange } from "@/app/(app)/reply-tracker/date-filter";

export const maxDuration = 300;

export default async function ReplyTrackerPage({
  searchParams,
}: {
  searchParams: { page?: string; timeRange?: TimeRange };
}) {
  const session = await auth();
  if (!session?.user.email) redirect("/login");

  const userId = session.user.id;
  const userEmail = session.user.email;

  const trackRepliesRule = await prisma.rule.findFirst({
    where: { userId, trackReplies: true },
    select: { trackReplies: true },
  });

  if (!trackRepliesRule?.trackReplies) {
    return <EnableReplyTracker />;
  }

  const page = Number(searchParams.page || "1");
  const timeRange = searchParams.timeRange || "all";

  return (
    <Tabs defaultValue="needsReply" className="flex h-full flex-col">
      <div className="content-container flex shrink-0 flex-col justify-between gap-x-4 space-y-2 border-b border-gray-200 bg-white py-2 shadow-sm md:flex-row md:gap-x-6 md:space-y-0">
        <div className="w-full overflow-x-auto">
          <div className="flex items-center justify-between">
            <TabsList>
              <TabsTrigger
                value="needsReply"
                className="flex items-center gap-2"
              >
                <MailIcon className="h-4 w-4" />
                To Reply
              </TabsTrigger>
              <TabsTrigger
                value="awaitingReply"
                className="flex items-center gap-2"
              >
                <ClockIcon className="h-4 w-4" />
                Waiting
              </TabsTrigger>
              {/* <TabsTrigger
                value="needsAction"
                className="flex items-center gap-2"
              >
                <AlertCircleIcon className="h-4 w-4" />
                Needs Action
              </TabsTrigger> */}

              <TabsTrigger value="resolved" className="flex items-center gap-2">
                <CheckCircleIcon className="h-4 w-4" />
                Resolved
              </TabsTrigger>
            </TabsList>
            <TimeRangeFilter />
          </div>
        </div>
      </div>

      <TabsContent value="needsReply" className="mt-0 flex-1">
        <NeedsReply
          userId={userId}
          userEmail={userEmail}
          page={page}
          timeRange={timeRange}
        />
      </TabsContent>

      <TabsContent value="awaitingReply" className="mt-0 flex-1">
        <AwaitingReply
          userId={userId}
          userEmail={userEmail}
          page={page}
          timeRange={timeRange}
        />
      </TabsContent>

      {/* <TabsContent value="needsAction" className="mt-0 flex-1">
        <NeedsAction userId={userId} userEmail={userEmail} page={page} />
      </TabsContent> */}

      <TabsContent value="resolved" className="mt-0 flex-1">
        <Resolved
          userId={userId}
          userEmail={userEmail}
          page={page}
          timeRange={timeRange}
        />
      </TabsContent>
    </Tabs>
  );
}
