import CreateListingForm from "@/components/CreateListingForm";

export default function NewListingPage() {
  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4">Create a New Listing</h1>
      <CreateListingForm />
    </div>
  );
}

