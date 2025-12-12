import { CalendarIcon, FileTextIcon } from "@radix-ui/react-icons"
import { Bell, Share2, Users, Receipt } from "lucide-react"
import { cn } from "@/lib/utils"
import { Calendar } from "@/components/ui/calendar"
import { AnimatedBeamDemo } from "@/components/AnimatedBeamDemo"
import { AnimatedListDemo } from "@/components/AnimatedListDemo"
import { BentoCard, BentoGrid } from "@/components/ui/BentoGrid"
import { Marquee } from "@/components/ui/marquee"

const expenses = [
  {
    name: "Dinner Split",
    body: "Split the bill equally among 4 friends at your favorite restaurant. Everyone pays their fair share instantly.",
  },
  {
    name: "Trip Expenses",
    body: "Track all vacation costs in one place - hotels, food, activities. Settle up with friends when you return.",
  },
  {
    name: "Rent & Utilities",
    body: "Monthly recurring expenses made simple. Never forget who owes what for rent, electricity, or internet.",
  },
  {
    name: "Group Gift",
    body: "Collecting money for a birthday gift? Track contributions and see who hasn't paid yet.",
  },
  {
    name: "Shared Groceries",
    body: "Roommates sharing groceries? Log purchases and split costs fairly based on usage or equally.",
  },
]

const features = [
  {
    Icon: Receipt,
    name: "Quick Expense Tracking",
    description: "Add expenses in seconds with smart splitting options.",
    href: "#",
    cta: "Start tracking",
    className: "col-span-3 lg:col-span-1",
    background: (
      <Marquee
        pauseOnHover
        className="absolute top-10 [mask-image:linear-gradient(to_top,transparent_40%,#000_100%)] [--duration:20s]"
      >
        {expenses.map((f, idx) => (
          <figure
            key={idx}
            className={cn(
              "relative w-32 cursor-pointer overflow-hidden rounded-xl border p-4",
              "border-gray-950/[.1] bg-gray-950/[.01] hover:bg-gray-950/[.05]",
              "dark:border-gray-50/[.1] dark:bg-gray-50/[.10] dark:hover:bg-gray-50/[.15]",
              "transform-gpu blur-[1px] transition-all duration-300 ease-out hover:blur-none"
            )}
          >
            <div className="flex flex-row items-center gap-2">
              <div className="flex flex-col">
                <figcaption className="text-sm font-medium dark:text-white">
                  {f.name}
                </figcaption>
              </div>
            </div>
            <blockquote className="mt-2 text-xs">{f.body}</blockquote>
          </figure>
        ))}
      </Marquee>
    ),
  },
  {
    Icon: Bell,
    name: "Smart Notifications",
    description: "Get notified about new expenses, settlements, and payment reminders.",
    href: "#",
    cta: "Learn more",
    className: "col-span-3 lg:col-span-2",
    background: (
      <AnimatedListDemo className="absolute top-4 right-2 h-[300px] w-full scale-75 border-none [mask-image:linear-gradient(to_top,transparent_10%,#000_100%)] transition-all duration-300 ease-out group-hover:scale-90" />
    ),
  },
  {
    Icon: Share2,
    name: "Easy Settlements",
    description: "See who owes whom at a glance. Settle debts with one tap.",
    href: "#",
    cta: "Learn more",
    className: "col-span-3 lg:col-span-2",
    background: (
      <div className="absolute top-4 right-2 h-[300px] border-none [mask-image:linear-gradient(to_top,transparent_10%,#000_100%)] transition-all duration-300 ease-out group-hover:scale-105">
        <AnimatedBeamDemo />
      </div>
    ),
  },
  {
    Icon: Users,
    name: "Multiple Groups",
    description: "Create separate groups for trips, roommates, family, and friends.",
    className: "col-span-3 lg:col-span-1",
    href: "#",
    cta: "Create group",
    background: (
      <Calendar
        mode="single"
        selected={new Date(2022, 4, 11, 0, 0, 0)}
        className="absolute top-10 right-0 origin-top scale-75 rounded-md border [mask-image:linear-gradient(to_top,transparent_40%,#000_100%)] transition-all duration-300 ease-out group-hover:scale-90"
      />
    ),
  },
]

export function BentoDemo() {
  return (
    <BentoGrid>
      {features.map((feature, idx) => (
        <BentoCard key={idx} {...feature} />
      ))}
    </BentoGrid>
  )
}