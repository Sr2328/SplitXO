import { motion } from "framer-motion";
import { Users, MoreVertical, Pencil, Trash2, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Group } from "@/hooks/useGroups";

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
  // Get member avatars from group_members array
  const members = group.group_members || [];
  const displayMembers = members.slice(0, 5);
  const remainingCount = Math.max(0, members.length - 5);
  const memberCount = group.member_count || members.length || 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
      className="bg-white dark:bg-gray-900 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer group/card"
      onClick={() => onClick(group)}
    >
      {/* Header with Image/Gradient */}
      <div className="relative h-32 bg-gradient-to-br from-green-400 via-emerald-500 to-teal-600 p-5">
        <div className="absolute top-4 right-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white rounded-lg opacity-0 group-hover/card:opacity-100 transition-opacity"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onManageMembers(group); }}>
                <UserPlus className="h-4 w-4 mr-2" />
                Manage Members
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit(group); }}>
                <Pencil className="h-4 w-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(e) => { e.stopPropagation(); onDelete(group); }}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        {/* Group Icon/Image */}
        {group.image_url ? (
          <img 
            src={group.image_url} 
            alt={group.name}
            className="h-16 w-16 rounded-2xl object-cover border-2 border-white/50 shadow-lg"
          />
        ) : (
          <div className="h-16 w-16 rounded-2xl bg-white/20 backdrop-blur-sm border-2 border-white/50 flex items-center justify-center shadow-lg">
            <Users className="h-8 w-8 text-white" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5 pt-4">
        <h3 className="font-bold text-foreground text-lg mb-1 line-clamp-1">
          {group.name}
        </h3>
        
        {group.description && (
          <p className="text-sm text-muted-foreground line-clamp-2 mb-4 leading-relaxed">
            {group.description}
          </p>
        )}

        {/* Members Section */}
        <div className="mt-4 pt-4 border-t border-border/50">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <span className="text-sm text-muted-foreground font-medium">
                Members Joined: <span className="text-foreground font-semibold">{memberCount}</span>
              </span>
            </div>
            
            {/* Member Avatars - Right Aligned */}
            {members.length > 0 && (
              <div className="flex items-center justify-end -space-x-2">
                {displayMembers.map((member) => (
                  <div
                    key={member.id}
                    className="h-9 w-9 rounded-full border-2 border-white dark:border-gray-900 hover:scale-110 hover:z-10 transition-transform cursor-pointer overflow-hidden bg-gradient-to-br from-green-400 to-teal-500 flex items-center justify-center text-white font-semibold text-xs shadow-md"
                    title={member.profile?.full_name || member.profile?.email}
                  >
                    {member.profile?.avatar_url ? (
                      <img 
                        src={member.profile.avatar_url} 
                        alt={member.profile?.full_name || member.profile?.email}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span>
                        {(member.profile?.full_name || member.profile?.email || "?").charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                ))}
                
                {/* +N indicator */}
                {remainingCount > 0 && (
                  <div
                    className="h-9 w-9 rounded-full border-2 border-white dark:border-gray-900 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center text-foreground font-bold text-xs shadow-md"
                  >
                    +{remainingCount}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}