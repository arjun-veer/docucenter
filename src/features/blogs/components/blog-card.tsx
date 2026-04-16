import Link from "next/link";
import { Heart, MessageCircle } from "lucide-react";
import {
  Card,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDate, formatCount } from "@/lib/formatters";
import type { Blog } from "@/lib/types";

interface BlogCardProps {
  blog: Blog;
}

export function BlogCard({ blog }: BlogCardProps) {
  const authorInitials = blog.author?.fullName
    ? blog.author.fullName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "?";

  return (
    <Card className="group flex flex-col overflow-hidden hover:border-foreground/20 transition-colors">
      {blog.coverImageUrl && (
        <Link href={`/blogs/${blog.slug}`} className="block">
          <div className="aspect-video overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={blog.coverImageUrl}
              alt={blog.title}
              className="h-full w-full object-cover transition-transform group-hover:scale-105"
            />
          </div>
        </Link>
      )}

      <CardContent className={blog.coverImageUrl ? "pt-4 flex-1" : "pt-6 flex-1"}>
        {blog.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {blog.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs font-normal">
                {tag}
              </Badge>
            ))}
            {blog.tags.length > 3 && (
              <Badge variant="outline" className="text-xs font-normal">
                +{blog.tags.length - 3}
              </Badge>
            )}
          </div>
        )}

        <Link href={`/blogs/${blog.slug}`} className="hover:underline">
          <h3 className="font-semibold leading-snug line-clamp-2 text-lg">
            {blog.title}
          </h3>
        </Link>

        {blog.excerpt && (
          <p className="text-sm text-muted-foreground mt-1.5 line-clamp-2">
            {blog.excerpt}
          </p>
        )}
      </CardContent>

      <CardFooter className="pt-0 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <Avatar className="h-6 w-6">
            <AvatarImage src={blog.author?.avatarUrl ?? undefined} />
            <AvatarFallback className="text-xs">{authorInitials}</AvatarFallback>
          </Avatar>
          <span className="text-xs text-muted-foreground truncate">
            {blog.author?.fullName ?? "Anonymous"}
          </span>
          <span className="text-xs text-muted-foreground shrink-0">
            {formatDate(blog.publishedAt)}
          </span>
        </div>

        <div className="flex items-center gap-3 shrink-0 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Heart className="h-3.5 w-3.5" />
            {formatCount(blog.likesCount)}
          </span>
          <span className="flex items-center gap-1">
            <MessageCircle className="h-3.5 w-3.5" />
            {formatCount(blog.commentsCount)}
          </span>
        </div>
      </CardFooter>
    </Card>
  );
}
