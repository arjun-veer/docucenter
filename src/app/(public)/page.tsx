import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Briefcase,
  GraduationCap,
  Building2,
  ArrowRight,
  Users,
  BookOpen,
  UserPlus,
  Search,
  Rocket,
  Target,
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="py-20 md:py-32 px-4">
        <div className="container mx-auto text-center max-w-4xl">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-tight">
            Your Career
            <br />
            <span className="text-muted-foreground">Starts Here</span>
          </h1>
          <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Jobs, competitive exams, and campus placements — all in one place.
            Built for students and fresh graduates.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-10">
            <Button size="lg" className="text-base px-8" asChild>
              <Link href="/jobs">
                Explore Jobs <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="text-base px-8"
              asChild
            >
              <Link href="/exams">Browse Exams</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-border bg-muted/30 py-12 px-4">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            {[
              { value: "10,000+", label: "Students", icon: Users },
              { value: "500+", label: "Job Listings", icon: Briefcase },
              { value: "200+", label: "Exams Tracked", icon: BookOpen },
            ].map((stat) => (
              <div
                key={stat.label}
                className="flex flex-col items-center gap-2"
              >
                <stat.icon className="h-6 w-6 text-muted-foreground" />
                <span className="text-3xl md:text-4xl font-bold">
                  {stat.value}
                </span>
                <span className="text-muted-foreground text-sm">
                  {stat.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold">
              Everything you need
            </h2>
            <p className="text-muted-foreground mt-3">
              One platform for your entire career journey
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: Briefcase,
                title: "Jobs",
                description:
                  "Browse thousands of job listings from top companies. Filter by type, location, and skills. Apply directly.",
                href: "/jobs",
              },
              {
                icon: GraduationCap,
                title: "Exams",
                description:
                  "Track registration dates, exam schedules, and results for all major competitive exams in India.",
                href: "/exams",
              },
              {
                icon: Building2,
                title: "Campus Placement",
                description:
                  "Get notified about placement drives at your college. View company details, eligibility, and apply.",
                href: "/signup",
              },
            ].map((feature) => (
              <Card
                key={feature.title}
                className="group hover:border-foreground/20 transition-colors"
              >
                <CardContent className="pt-6">
                  <div className="h-12 w-12 rounded-lg bg-foreground flex items-center justify-center mb-4">
                    <feature.icon className="h-6 w-6 text-background" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {feature.description}
                  </p>
                  <Link
                    href={feature.href}
                    className="inline-flex items-center text-sm font-medium mt-4 group-hover:underline"
                  >
                    Learn more <ArrowRight className="ml-1 h-3 w-3" />
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 px-4 bg-muted/30 border-y border-border">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold">How it works</h2>
            <p className="text-muted-foreground mt-3">
              Get started in minutes
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              {
                step: "01",
                icon: UserPlus,
                title: "Sign Up",
                desc: "Create your free account",
              },
              {
                step: "02",
                icon: Target,
                title: "Set Profile",
                desc: "Add your skills and college",
              },
              {
                step: "03",
                icon: Search,
                title: "Explore",
                desc: "Find jobs, exams, and drives",
              },
              {
                step: "04",
                icon: Rocket,
                title: "Get Placed",
                desc: "Apply and land your dream role",
              },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="text-xs font-mono text-muted-foreground mb-3">
                  {item.step}
                </div>
                <div className="h-12 w-12 rounded-full bg-foreground text-background flex items-center justify-center mx-auto mb-3">
                  <item.icon className="h-5 w-5" />
                </div>
                <h3 className="font-semibold mb-1">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Blog / Community Teaser */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold">
            Community & Blogs
          </h2>
          <p className="text-muted-foreground mt-3 max-w-2xl mx-auto">
            Share your exam preparation tips, interview experiences, and career
            advice with thousands of students.
          </p>
          <div className="flex gap-4 justify-center mt-8">
            <Button size="lg" asChild>
              <Link href="/blogs">Read Blogs</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/signup">Start Writing</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 bg-foreground text-background">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold">
            Ready to get started?
          </h2>
          <p className="mt-3 text-background/70">
            Join thousands of students building their careers.
          </p>
          <Button
            size="lg"
            variant="secondary"
            className="mt-8 text-base px-8"
            asChild
          >
            <Link href="/signup">
              Create free account <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
