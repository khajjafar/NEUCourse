import CourseDetailClient from "@/components/CourseDetailClient";

export default async function CourseDetailModal({
    params,
}: {
    params: Promise<{ courseId: string }>;
}) {
    const { courseId } = await params;
    // This route intercepts standard navigation (a user clicking a Link to `/courses/[courseId]`)
    // NextJS mounts the component above the existing page utilizing the slot layout context.
    return <CourseDetailClient courseId={courseId} isModal={true} />;
}
