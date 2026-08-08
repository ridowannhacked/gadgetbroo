import { format } from "date-fns";
import { User, Mail, Calendar, Shield } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { unauthorized } from "next/navigation";
import { getServerSession } from "../../../helpers/get-servesession";
import prisma from "../../../lib/prisma";

export const metadata: Metadata = {
  title: "My Profile - GadgetBroo",
};

export default async function DashboardPage() {
  const session = await getServerSession();
  const user = session?.user;
  if (!user) unauthorized();

  const fullUser = await prisma.user.findUnique({
    where: { id: user.id },
    include: { role: true },
  });

  if (!fullUser) return <p>User not found</p>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">My Profile</h1>
        <p className="text-sm text-slate-400 mt-1">Manage your account details.</p>
      </div>

      <div className="bg-[#0b0f19] border border-slate-800/60 rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-center sm:items-start gap-8">
        
        {/* Avatar Placeholder */}
        <div className="w-32 h-32 bg-slate-800 rounded-full border-4 border-[#070a12] flex items-center justify-center text-slate-500 shadow-xl shrink-0">
          <User size={48} />
        </div>

        {/* Info */}
        <div className="flex-1 space-y-4 text-center sm:text-left">
          <div>
            <h2 className="text-2xl font-bold text-white">{fullUser.name}</h2>
            <div className="flex items-center justify-center sm:justify-start gap-2 text-slate-400 mt-1">
              <Mail size={14} />
              <span className="text-sm">{fullUser.email}</span>
              {!fullUser.emailVerified && (
                <span className="text-[10px] bg-red-500/10 text-red-400 px-2 py-0.5 rounded-full border border-red-500/20 font-semibold uppercase tracking-wider ml-2">
                  Unverified
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-800/50">
            <div>
              <div className="text-[11px] text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1.5 justify-center sm:justify-start">
                <Calendar size={12} /> Member Since
              </div>
              <div className="text-slate-300 font-medium">
                {format(fullUser.createdAt, "MMMM d, yyyy")}
              </div>
            </div>
            
            {fullUser.role && (
              <div>
                <div className="text-[11px] text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1.5 justify-center sm:justify-start">
                  <Shield size={12} /> Account Role
                </div>
                <div className="text-blue-400 font-medium capitalize flex items-center justify-center sm:justify-start gap-2">
                  {fullUser.role.name}
                  {fullUser.role.name === 'admin' && (
                    <Link href="/admin" className="text-[10px] bg-blue-600 text-white px-2 py-0.5 rounded hover:bg-blue-500 transition-colors">
                      Admin Panel
                    </Link>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
