import { useSelector } from 'react-redux';

const useCurrentUser = () => {
  // @ts-ignore
  const user = useSelector(state => state.auth.user);
  return user;
};

export default useCurrentUser;
