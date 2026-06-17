interface LayoutProps {
  children: React.ReactNode;
}

const FrontLayout = ({ children }: Readonly<LayoutProps>) => {
  return <div>{children}</div>;
};

export default FrontLayout;
