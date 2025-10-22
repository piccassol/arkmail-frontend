"use client"

export const dynamic = 'force-dynamic'


import { useEffect, useState } from "react";
import { useUser } from '@clerk/nextjs';
import { useRouter } from "next/navigation";
import { emailApi, Email } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { FolderArchive, RefreshCw, Inbox, Send, Trash2, RotateCcw } from "lucide-react";

export default function ArchivePage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [emails, setEmails] = useState<Email[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push("/login");
    }
  }, [isLoaded, isSignedIn, router]);

  const fetchArchived = async () => {
    try {
      setLoading(true);
      const data = await emailApi.getArchived();
      setEmails(data);
    } catch (error: any) {
      toast.error(error.message || "Failed to load archived emails");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === "authenticated") {
      fetchArchived();
    }
  }, [status]);

  const handleRestore = async (emailId: number) => {
    try {
      await emailApi.update(emailId, { is_archived: false });
      toast.success("Email restored to inbox");
      fetchArchived();
    } catch (error: any) {
      toast.error(error.message || "Failed to restore email");
    }
  };

  const handleDelete = async (emailId: number) => {
    try {
      await emailApi.moveToTrash(emailId);
      toast.success("Email moved to trash");
      fetchArchived();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete email");
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-6 py-6">
          <Skeleton className="h-12 w-64 mb-4" />
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
              <FolderArchive className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-3xl font-bold">Archive</h1>
                <p className="text-sm text-muted-foreground">
                  {emails.length} archived {emails.length === 1 ? "email" : "emails"}
                </p>
              </div>
            </div>
            <Button variant="outline" size="icon" onClick={fetchArchived} disabled={loading}>
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <Card className="p-4">
              <nav className="space-y-2">
                <Button variant="ghost" className="w-full justify-start" onClick={() => router.push("/inbox")}>
                  <Inbox className="h-4 w-4 mr-2" />
                  Inbox
                </Button>
                <Button variant="ghost" className="w-full justify-start" onClick={() => router.push("/sent")}>
                  <Send className="h-4 w-4 mr-2" />
                  Sent
                </Button>
                <Button variant="default" className="w-full justify-start">
                  <FolderArchive className="h-4 w-4 mr-2" />
                  Archive
                </Button>
                <Button variant="ghost" className="w-full justify-start" onClick={() => router.push("/trash")}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Trash
                </Button>
              </nav>
            </Card>
          </div>

          <div className="lg:col-span-3">
            {emails.length === 0 ? (
              <Card className="p-12 text-center">
                <FolderArchive className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">No archived emails</h3>
                <p className="text-muted-foreground">
                  Emails you archive will appear here.
                </p>
              </Card>
            ) : (
              <div className="space-y-2">
                {emails.map((email) => (
                  <Card key={email.id} className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-lg mb-1 truncate">{email.subject}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {email.body.replace(/<[^>]*>/g, "").substring(0, 150)}...
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleRestore(email.id)}>
                          <RotateCcw className="h-4 w-4 mr-1" />
                          Restore
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleDelete(email.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


// ==================== app/trash/page.tsx ====================
// Create a new file: app/trash/page.tsx
// Copy the archive page and modify:
// - Change FolderArchive to Trash2
// - Use emailApi.getTrash() instead of getArchived()
// - Add permanent delete option
// - Use emailApi.restore() for restore action