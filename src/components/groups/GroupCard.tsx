// import { motion } from "framer-motion";
// import { Users, MoreVertical, Pencil, Trash2, UserPlus } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu";
// import { Group } from "@/hooks/useGroups";

// interface GroupCardProps {
//   group: Group;
//   onEdit: (group: Group) => void;
//   onDelete: (group: Group) => void;
//   onManageMembers: (group: Group) => void;
//   onClick: (group: Group) => void;
//   delay?: number;
// }

// export function GroupCard({
//   group,
//   onEdit,
//   onDelete,
//   onManageMembers,
//   onClick,
//   delay = 0,
// }: GroupCardProps) {
//   // Get member avatars from group_members array
//   const members = group.group_members || [];
//   const displayMembers = members.slice(0, 5);
//   const remainingCount = Math.max(0, members.length - 5);
//   const memberCount = group.member_count || members.length || 0;

//   return (
//     <motion.div
//       initial={{ opacity: 0, y: 20 }}
//       animate={{ opacity: 1, y: 0 }}
//       transition={{ duration: 0.3, delay }}
//       className="bg-white dark:bg-gray-900 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer group/card"
//       onClick={() => onClick(group)}
//     >
//       {/* Header with Image/Gradient */}
//       <div className="relative h-32 bg-gradient-to-br from-green-400 via-emerald-500 to-teal-600 p-5">
//         <div className="absolute top-4 right-4">
//           <DropdownMenu>
//             <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
//               <Button
//                 variant="ghost"
//                 size="icon"
//                 className="h-8 w-8 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white rounded-lg opacity-0 group-hover/card:opacity-100 transition-opacity"
//               >
//                 <MoreVertical className="h-4 w-4" />
//               </Button>
//             </DropdownMenuTrigger>
//             <DropdownMenuContent align="end">
//               <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onManageMembers(group); }}>
//                 <UserPlus className="h-4 w-4 mr-2" />
//                 Manage Members
//               </DropdownMenuItem>
//               <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit(group); }}>
//                 <Pencil className="h-4 w-4 mr-2" />
//                 Edit
//               </DropdownMenuItem>
//               <DropdownMenuItem
//                 onClick={(e) => { e.stopPropagation(); onDelete(group); }}
//                 className="text-destructive focus:text-destructive"
//               >
//                 <Trash2 className="h-4 w-4 mr-2" />
//                 Delete
//               </DropdownMenuItem>
//             </DropdownMenuContent>
//           </DropdownMenu>
//         </div>
        
//         {/* Group Icon/Image */}
//         {group.image_url ? (
//           <img 
//             src={group.image_url} 
//             alt={group.name}
//             className="h-16 w-16 rounded-2xl object-cover border-2 border-white/50 shadow-lg"
//           />
//         ) : (
//           <div className="h-16 w-16 rounded-2xl bg-white/20 backdrop-blur-sm border-2 border-white/50 flex items-center justify-center shadow-lg">
//             <Users className="h-8 w-8 text-white" />
//           </div>
//         )}
//       </div>

//       {/* Content */}
//       <div className="p-5 pt-4">
//         <h3 className="font-bold text-foreground text-lg mb-1 line-clamp-1">
//           {group.name}
//         </h3>
        
//         {group.description && (
//           <p className="text-sm text-muted-foreground line-clamp-2 mb-4 leading-relaxed">
//             {group.description}
//           </p>
//         )}

//         {/* Members Section */}
//         <div className="mt-4 pt-4 border-t border-border/50">
//           <div className="flex items-center justify-between">
//             <div className="flex-1">
//               <span className="text-sm text-muted-foreground font-medium">
//                 Members Joined: <span className="text-foreground font-semibold">{memberCount}</span>
//               </span>
//             </div>
            
//             {/* Member Avatars - Right Aligned */}
//             {members.length > 0 && (
//               <div className="flex items-center justify-end -space-x-2">
//                 {displayMembers.map((member) => (
//                   <div
//                     key={member.id}
//                     className="h-9 w-9 rounded-full border-2 border-white dark:border-gray-900 hover:scale-110 hover:z-10 transition-transform cursor-pointer overflow-hidden bg-gradient-to-br from-green-400 to-teal-500 flex items-center justify-center text-white font-semibold text-xs shadow-md"
//                     title={member.profile?.full_name || member.profile?.email}
//                   >
//                     {member.profile?.avatar_url ? (
//                       <img 
//                         src={member.profile.avatar_url} 
//                         alt={member.profile?.full_name || member.profile?.email}
//                         className="h-full w-full object-cover"
//                       />
//                     ) : (
//                       <span>
//                         {(member.profile?.full_name || member.profile?.email || "?").charAt(0).toUpperCase()}
//                       </span>
//                     )}
//                   </div>
//                 ))}
                
//                 {/* +N indicator */}
//                 {remainingCount > 0 && (
//                   <div
//                     className="h-9 w-9 rounded-full border-2 border-white dark:border-gray-900 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center text-foreground font-bold text-xs shadow-md"
//                   >
//                     +{remainingCount}
//                   </div>
//                 )}
//               </div>
//             )}
//           </div>
//         </div>
//       </div>
//     </motion.div>
//   );
// }



// +++++++++++++++++++++++++++++++++
// +++++++++++++++++++++++++++++++++



import { motion } from "framer-motion";
import { Users, MoreVertical, Pencil, Trash2, UserPlus, Sparkles, ArrowRight, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Group } from "@/hooks/useGroups";

// ============ GROUP CARD COMPONENT ============
interface GroupCardProps {
  group: Group;
  onEdit: (group: Group) => void;
  onDelete: (group: Group) => void;
  onManageMembers: (group: Group) => void;
  onClick: (group: Group) => void;
  delay?: number;
}

export function GroupCard({
  group,
  onEdit,
  onDelete,
  onManageMembers,
  onClick,
  delay = 0,
}: GroupCardProps) {
  const members = group.group_members || [];
  const displayMembers = members.slice(0, 4);
  const remainingCount = Math.max(0, members.length - 4);
  const memberCount = group.member_count || members.length || 0;

  const getInitials = (name: string) => {
    if (!name) return "?";
    const words = name.trim().split(" ");
    if (words.length === 1) return words[0][0].toUpperCase();
    return (words[0][0] + words[words.length - 1][0]).toUpperCase();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
      className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer group/card hover:-translate-y-1 border border-border/50 h-full flex flex-col"
      onClick={() => onClick(group)}
    >
      {/* Header with Gradient - Icon on LEFT */}
      <div className="relative h-20 sm:h-24 lg:h-28 bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-600 p-3 sm:p-4 overflow-hidden">
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/20" />

        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-20 sm:w-28 h-20 sm:h-28 bg-white/10 rounded-full -mr-10 sm:-mr-14 -mt-10 sm:-mt-14 group-hover/card:scale-110 transition-transform duration-500" />
        <div className="absolute bottom-0 left-0 w-16 sm:w-20 h-16 sm:h-20 bg-white/10 rounded-full -ml-8 sm:-ml-10 -mb-8 sm:-mb-10 group-hover/card:scale-110 transition-transform duration-500" />

        {/* Sparkle effect */}
        <div className="absolute top-2 right-3 opacity-0 group-hover/card:opacity-100 transition-opacity duration-300">
          <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 text-white/60" />
        </div>

        {/* Header Content - Flex with Icon LEFT + Menu RIGHT */}
        <div className="relative z-[1] flex items-center justify-between gap-3">
          {/* Group Icon - LEFT */}
          <div className="flex-shrink-0">
            {group.image_url ? (
              <img
                src={group.image_url}
                alt={group.name}
                className="h-12 w-12 sm:h-14 sm:w-14 lg:h-16 lg:w-16 rounded-xl object-cover border-3 border-white/50 shadow-lg group-hover/card:scale-105 transition-transform"
              />
            ) : (
              <div className="h-12 w-12 sm:h-14 sm:w-14 lg:h-16 lg:w-16 rounded-xl bg-white/20 backdrop-blur-md border-3 border-white/50 flex items-center justify-center shadow-lg group-hover/card:scale-105 group-hover/card:bg-white/30 transition-all">
                <Users className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 text-white" />
              </div>
            )}
          </div>

          {/* Actions Menu - RIGHT */}
          <div className="ml-auto flex-shrink-0">
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 sm:h-9 sm:w-9 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white rounded-xl opacity-0 group-hover/card:opacity-100 transition-all shadow-lg"
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    onManageMembers(group);
                  }}
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Manage Members
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(group);
                  }}
                >
                  <Pencil className="h-4 w-4 mr-2" />
                  Edit Group
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(group);
                  }}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Group
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-3 sm:p-4 flex-1 flex flex-col">
        <h3 className="font-bold text-foreground text-sm sm:text-base mb-1 line-clamp-1 group-hover/card:text-primary transition-colors">
          {group.name}
        </h3>

        <p className="text-xs text-muted-foreground line-clamp-2 min-h-[28px] sm:min-h-[32px] leading-relaxed mb-3">
          {group.description || "No description provided"}
        </p>

        {/* Members Section */}
        <div className="mt-auto pt-3 border-t border-border/50">
          <div className="flex items-center justify-between gap-2">
            {/* Member Avatars - Left Side */}
            {members.length > 0 ? (
              <div className="flex -space-x-2">
                {displayMembers.map((member, idx) => (
                  <Avatar
                    key={member.id}
                    className="h-7 w-7 sm:h-8 sm:w-8 border-2 border-white dark:border-gray-900 hover:scale-110 hover:z-20 transition-transform cursor-pointer shadow-md"
                    style={{ zIndex: displayMembers.length - idx }}
                    title={member.profile?.full_name || member.profile?.email}
                  >
                    <AvatarImage src={member.profile?.avatar_url} />
                    <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white text-xs font-semibold">
                      {getInitials(member.profile?.full_name || member.profile?.email || "?")}
                    </AvatarFallback>
                  </Avatar>
                ))}

                {/* +N indicator */}
                {remainingCount > 0 && (
                  <div
                    className="h-7 w-7 sm:h-8 sm:w-8 rounded-full border-2 border-white dark:border-gray-900 bg-muted flex items-center justify-center shadow-md hover:scale-110 transition-transform text-xs font-bold text-muted-foreground"
                    title={`+${remainingCount} more member${remainingCount > 1 ? "s" : ""}`}
                    style={{ zIndex: 0 }}
                  >
                    +{remainingCount}
                  </div>
                )}
              </div>
            ) : (
              <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-muted flex items-center justify-center shadow-sm">
                <Users className="h-3.5 w-3.5" />
              </div>
            )}

            {/* Member Count - Right Side */}
            <div className="flex items-center gap-1 ml-auto">
              <div className="p-1 rounded-lg bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950 dark:to-teal-950 shadow-sm flex items-center justify-center">
                <Users className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <span className="text-xs sm:text-sm font-semibold text-foreground">
                {memberCount}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Hover Indicator */}
      <div className="px-3 pb-2 sm:pb-3">
        <div className="flex items-center justify-center gap-1 opacity-0 group-hover/card:opacity-100 transition-opacity text-xs text-muted-foreground">
          <span className="hidden sm:inline">Click to view</span>
          <span className="sm:hidden">View</span>
        </div>
      </div>
    </motion.div>
  );
}