"use client"

import { cn } from "@/lib/utils"
import { AnimatedList } from "@/components/ui/AnimatedList"

interface Item {
  name: string
  description: string
  icon: string
  color: string
  time: string

}

let notifications = [
  {
    name: "Expense added",
    description: "A new expense was added to your dashboard.",
    time: "15m ago",
    icon: "🧾",
    color: "#16a34a", // green-600
  },
  {
    name: "Split request",
    description: "You have a new split request from a group member.",
    time: "12m ago",
    icon: "🔗",
    color: "#22c55e", // green-500
  },
  {
    name: "Settlement completed",
    description: "A pending amount has been settled successfully.",
    time: "8m ago",
    icon: "✔️",
    color: "#15803d", // green-700
  },
  {
    name: "Added to group",
    description: "You have been added to a new group.",
    time: "6m ago",
    icon: "👥",
    color: "#4ade80", // green-400
  },
  {
    name: "Reminder",
    description: "You have pending amounts to settle.",
    time: "3m ago",
    icon: "⏰",
    color: "#86efac", // green-300
  },
  {
    name: "Expense updated",
    description: "An existing expense has been modified.",
    time: "1m ago",
    icon: "✏️",
    color: "#bbf7d0", // green-200
  }
];


notifications = Array.from({ length: 10 }, () => notifications).flat()

const Notification = ({ name, description, icon, color, time }: Item) => {
  return (
    <figure
      className={cn(
        "relative mx-auto min-h-fit w-full max-w-[400px] cursor-pointer overflow-hidden rounded-2xl p-4",
        // animation styles
        "transition-all duration-200 ease-in-out hover:scale-[103%]",
        // light styles
        "bg-white [box-shadow:0_0_0_1px_rgba(0,0,0,.03),0_2px_4px_rgba(0,0,0,.05),0_12px_24px_rgba(0,0,0,.05)]",
        // dark styles
        "transform-gpu dark:bg-transparent dark:[box-shadow:0_-20px_80px_-20px_#ffffff1f_inset] dark:backdrop-blur-md dark:[border:1px_solid_rgba(255,255,255,.1)]"
      )}
    >
      <div className="flex flex-row items-center gap-3">
        <div
          className="flex size-10 items-center justify-center rounded-2xl"
          style={{
            backgroundColor: color,
          }}
        >
          <span className="text-lg">{icon}</span>
        </div>
        <div className="flex flex-col overflow-hidden">
          <figcaption className="flex flex-row items-center text-lg font-medium whitespace-pre dark:text-white">
            <span className="text-sm sm:text-lg">{name}</span>
            <span className="mx-1">·</span>
            <span className="text-xs text-gray-500">{time}</span>
          </figcaption>
          <p className="text-sm font-normal dark:text-white/60">
            {description}
          </p>
        </div>
      </div>
    </figure>
  )
}

export function AnimatedListDemo({
  className,
}: {
  className?: string
}) {
  return (
    <div
      className={cn(
        "relative flex h-[500px] w-full flex-col overflow-hidden p-2",
        className
      )}
    >
      <AnimatedList>
        {notifications.map((item, idx) => (
          <Notification {...item} key={idx} />
        ))}
      </AnimatedList>

      <div className="from-background pointer-events-none absolute inset-x-0 bottom-0 h-1/4 bg-gradient-to-t"></div>
    </div>
  )
}
