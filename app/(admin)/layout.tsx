interface LayoutProps {
  children: React.ReactNode;
}
const AdminLayout = ({ children }: Readonly<LayoutProps>) => {
  return <div>{children}</div>;
};

export default AdminLayout;
