import {useSelector} from 'react-redux';
import {RootState} from '../redux/reducers';

const useCurrentUser = () => {
  const user: any = useSelector<RootState>((state) => state.auth.user);
  return user;
};

export default useCurrentUser;
