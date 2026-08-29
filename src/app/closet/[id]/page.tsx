import ItemEditor from "@/components/closet/ItemEditor";

export default async function ItemPage({ params }: PageProps<"/closet/[id]">) {
  const { id } = await params;
  return <ItemEditor itemId={id} />;
}
