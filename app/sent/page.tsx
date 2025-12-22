"use client"

export const dynamic = 'force-dynamic'


import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { emailApi, Email } from "@/lib/api";
import { getBackendToken } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
  Send,
  RefreshCw,
  Trash2,
  Mail,
  Inbox,
  FolderArchive,
} from "lucide-react";

export default function SentPage() {
  const { user, isLoaded, isSignedIn } = useUser();
  const router = useRouter();
  const [emails, setEmails] = useState<Email[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push("/sign-in");
    }
  }, [isLoaded, isSignedIn, router]);
  
  const fetchSent = async () => {
    try {
      setLoading(true);
      const data = await emailApi.getSent();
      setEmails(data);
    } catch (error: any) {
      console.error("Failed to fetch sent emails:", error);
      toast.error(error.message || "Failed to load sent emails");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const initAndFetch = async () => {
      if (isSignedIn && user) {
        await getBackendToken(user);
        fetchSent();
      }
    };
    initAndFetch();
  }, [isSignedIn, user]);

  const handleTrash = async (emailId: number) => {
    try {
      await emailApi.moveToTrash(emailId);
      toast.success("Email moved to trash");
      fetchSent();
    } catch (error: any) {
      toast.error(error.message || "Failed to move email to trash");
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
      });
    }
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="border-b">
          <div className="container mx-auto px-6 py-4">
            <Skeleton className="h-12 w-64" />
          </div>
        </div>
        <div className="container mx-auto px-6 py-6 space-y-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-card">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Send className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-3xl font-bold">Sent</h1>
                <p className="text-sm text-muted-foreground">
                  {emails.length} {emails.length === 1 ? "email" : "emails"} sent
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={fetchSent}
                disabled={loading}
              >
                <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <Card className="p-4">
              <nav className="space-y-2">
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => router.push("/inbox")}
                >
                  <Inbox className="h-4 w-4 mr-2" />
                  Inbox
                </Button>
                <Button
                  variant="default"
                  className="w-full justify-start"
                  onClick={() => router.push("/sent")}
                >
                  <Send className="h-4 w-4 mr-2" />
                  Sent
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => router.push("/archive")}
                >
                  <FolderArchive className="h-4 w-4 mr-2" />
                  Archive
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => router.push("/trash")}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Trash
                </Button>
              </nav>
            </Card>
          </div>

          <div className="lg:col-span-3">
            {emails.length === 0 ? (
              <Card className="p-12 text-center">
                <Mail className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">No sent emails</h3>
                <p className="text-muted-foreground mb-4">
                  You haven't sent any emails yet.
                </p>
              </Card>
            ) : (
              <div className="space-y-2">
                {emails.map((email) => (
                  <Card
                    key={email.id}
                    className={`p-4 cursor-pointer hover:bg-accent transition-colors ${
                      selectedEmail?.id === email.id ? "bg-accent border-primary" : ""
                    }`}
                    onClick={() => setSelectedEmail(email)}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold truncate">
                            To: {email.recipient}
                          </span>
                        </div>
                        <h3 className="font-medium text-lg mb-1 truncate">
                          {email.subject}
                        </h3>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {email.body.replace(/<[^>]*>/g, "").substring(0, 150)}...
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <span className="text-sm text-muted-foreground whitespace-nowrap">
                          {formatDate(email.created_at)}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleTrash(email.id);
                          }}
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}

            {selectedEmail && (
              <Card className="mt-6 p-6">
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="text-2xl font-bold mb-2">
                        {selectedEmail.subject}
                      </h2>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <p><strong>To:</strong> {selectedEmail.recipient}</p>
                        <p><strong>Sent:</strong> {new Date(selectedEmail.created_at).toLocaleString()}</p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => setSelectedEmail(null)}
                    >
                      Close
                    </Button>
                  </div>
                  <hr />
                  <div
                    className="prose prose-sm max-w-none dark:prose-invert"
                    dangerouslySetInnerHTML={{ __html: selectedEmail.body }}
                  />
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}