import {combineReducers} from 'redux';
import {auth} from './auth';
import filter from './filter';

const LOG_OUT = 'LOG_OUT';

// combine reducers to build the state
const appReducer = combineReducers({auth, filter});

const rootReducer = (state, action) => {
  if (action.type === LOG_OUT) {
    state = undefined;
  }

  return appReducer(state, action);
};

export default rootReducer;
