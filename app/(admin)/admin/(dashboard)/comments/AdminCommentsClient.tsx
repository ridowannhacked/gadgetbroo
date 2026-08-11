"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Search, ExternalLink, ShieldAlert, Check, X, Trash2, Edit2, Reply } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { Input } from "@/components/ui/input";

type AdminComment = {
  id: string;
  body: string;
  isPublic: boolean;
  adminReply: string | null;
  createdAt: string | Date;
  user: { name: string | null; email: string };
  product: { name: string; slug: string };
};

export default function AdminCommentsClient({ initialComments }: { initialComments: AdminComment[] }) {
  const [comments, setComments] = useState<AdminComment[]>(initialComments);
  const [searchQuery, setSearchQuery] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");

  const filteredComments = comments.filter(c => 
    c.body.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleVisibility = async (id: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/comments/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPublic: !currentStatus })
      });
      if (res.ok) {
        toast.success(`Comment is now ${!currentStatus ? 'Public' : 'Private'}`);
        setComments(comments.map(c => c.id === id ? { ...c, isPublic: !currentStatus } : c));
      } else {
        throw new Error();
      }
    } catch {
      toast.error("Failed to update visibility");
    }
  };

  const deleteComment = async (id: string) => {
    if (!confirm("Are you sure you want to delete this comment permanently?")) return;
    try {
      const res = await fetch(`/api/comments/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Comment deleted");
        setComments(comments.filter(c => c.id !== id));
      } else {
        throw new Error();
      }
    } catch {
      toast.error("Failed to delete comment");
    }
  };

  const submitReply = async (id: string) => {
    try {
      const res = await fetch(`/api/comments/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminReply: replyContent.trim() || null }) // Send null if empty to clear
      });
      if (res.ok) {
        toast.success("Reply saved");
        setComments(comments.map(c => c.id === id ? { ...c, adminReply: replyContent.trim() || null } : c));
        setReplyingTo(null);
        setReplyContent("");
      } else {
        throw new Error();
      }
    } catch {
      toast.error("Failed to save reply");
    }
  };

  return (
    <div className="min-h-screen bg-[#0d0f12] text-slate-200 p-4 sm:p-6 lg:p-10">
      <div className="max-w-7xl mx-auto space-y-6">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              Customer Comments & Q&A
            </h1>
            <p className="text-sm text-slate-400 mt-1">Manage private customer inquiries and public comments.</p>
          </div>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
          <Input
            placeholder="Search by customer, product, or comment content..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-[#12151a]/80 border-slate-800/80 text-slate-200 placeholder:text-slate-500 w-full sm:max-w-md"
          />
        </div>

        <div className="space-y-4">
          {filteredComments.length === 0 ? (
            <div className="text-center py-12 bg-[#12151a]/80 rounded-xl border border-slate-800/80">
              <p className="text-slate-500">No comments found.</p>
            </div>
          ) : filteredComments.map((comment) => (
            <div key={comment.id} className="bg-[#12151a]/80 border border-slate-800/80 rounded-xl p-5 shadow-xl backdrop-blur-sm relative flex flex-col sm:flex-row gap-6">
              
              <div className="flex-1 space-y-3">
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-white">{comment.user.name}</span>
                  <span className="text-xs text-slate-500">{comment.user.email}</span>
                  <span className="text-xs text-slate-600">•</span>
                  <span className="text-xs text-slate-500">{format(new Date(comment.createdAt), "MMM d, yyyy h:mm a")}</span>
                </div>
                
                <Link href={`/product/${comment.product.slug}`} className="inline-flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 transition-colors">
                  Product: {comment.product.name} <ExternalLink size={12} />
                </Link>

                <p className="text-sm text-slate-300 bg-[#0a0a0a] p-4 rounded-lg border border-slate-800/50 whitespace-pre-wrap">
                  {comment.body}
                </p>

                {replyingTo === comment.id ? (
                  <div className="mt-4 bg-slate-900/50 p-4 rounded-lg border border-slate-800">
                    <label className="block text-xs font-semibold text-blue-400 uppercase tracking-wider mb-2">Your Reply (Admin)</label>
                    <textarea 
                      value={replyContent}
                      onChange={(e) => setReplyContent(e.target.value)}
                      placeholder="Write a reply (leave blank to clear)..."
                      className="w-full h-24 bg-[#0a0a0a] border border-slate-700 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-blue-500 resize-none mb-3"
                    />
                    <div className="flex gap-2">
                      <button onClick={() => submitReply(comment.id)} className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium">
                        Save Reply
                      </button>
                      <button onClick={() => setReplyingTo(null)} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm font-medium">
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  comment.adminReply && (
                    <div className="mt-3 ml-4 p-4 bg-blue-900/10 border-l-2 border-blue-500 rounded-r-lg group/reply relative">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">Admin Reply</span>
                        <button 
                          onClick={() => { setReplyingTo(comment.id); setReplyContent(comment.adminReply); }}
                          className="opacity-0 group-hover/reply:opacity-100 text-slate-400 hover:text-blue-400 p-1 transition-opacity"
                        >
                          <Edit2 size={12} />
                        </button>
                      </div>
                      <p className="text-sm text-blue-100/80 whitespace-pre-wrap">
                        {comment.adminReply}
                      </p>
                    </div>
                  )
                )}
              </div>

              {/* Actions Sidebar */}
              <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-4 min-w-[140px] border-t sm:border-t-0 sm:border-l border-slate-800/80 pt-4 sm:pt-0 sm:pl-4">
                <div className="flex flex-col items-center sm:items-end gap-1.5 w-full">
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Visibility</span>
                  <button
                    onClick={() => toggleVisibility(comment.id, comment.isPublic)}
                    className={`w-full flex items-center justify-center sm:justify-between px-3 py-1.5 rounded-md text-xs font-medium transition-colors border ${
                      comment.isPublic 
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20' 
                        : 'bg-amber-500/10 text-amber-500 border-amber-500/20 hover:bg-amber-500/20'
                    }`}
                  >
                    {comment.isPublic ? (
                      <><Check size={14} className="mr-1.5" /> Public</>
                    ) : (
                      <><ShieldAlert size={14} className="mr-1.5" /> Private</>
                    )}
                  </button>
                </div>

                <div className="flex sm:flex-col gap-2 w-full mt-auto">
                  {!replyingTo && (
                    <button
                      onClick={() => { setReplyingTo(comment.id); setReplyContent(comment.adminReply || ""); }}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-medium transition-colors"
                    >
                      <Reply size={14} /> Reply
                    </button>
                  )}
                  <button
                    onClick={() => deleteComment(comment.id)}
                    className="flex items-center justify-center gap-2 px-3 py-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg text-xs font-medium transition-colors"
                  >
                    <Trash2 size={14} /> Delete
                  </button>
                </div>
              </div>

            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
