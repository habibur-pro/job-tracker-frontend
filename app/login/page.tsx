import LoginPage from "@/components/pages/LoginPage";

const page = async ({ params }: { params: Promise<{ error: string }> }) => {
  const { error } = await params;
  return (
    <div>
      <LoginPage err={error as string} />
    </div>
  );
};

export default page;
