import { useAuth } from "@/modules/front/auth/hooks/use-auth";

const UserNav = () => {
  const { actions } = useAuth();

  return (
    <div onClick={() => actions.signOut()}>Sign Out</div>
  )
}

export default UserNav