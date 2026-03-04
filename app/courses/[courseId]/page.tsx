import CourseDetailClient from "@/components/CourseDetailClient";

export default async function CourseDetailPage({
    params,
}: {
    params: Promise<{ courseId: string }>;
}) {
    const { courseId } = await params;
    // The regular page renders it as a full screen entity
    return <CourseDetailClient courseId={courseId} isModal={false} />;
}
