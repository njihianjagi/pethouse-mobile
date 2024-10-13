const UPDATE_FILTER = 'UPDATE_FILTER';
const RESET_FILTER = 'RESET_FILTER';

export const updateFilter = (filterData) => ({
  type: UPDATE_FILTER,
  data: filterData,
});

export const resetFilter = () => ({
  type: RESET_FILTER,
});

const initialState = {
  traitPreferences: {},
  selectedGroups: [],
  searchText: '',
  sortOption: 'nameAsc',
};

export const filter = (state = initialState, action) => {
  switch (action.type) {
    case UPDATE_FILTER:
      return {
        ...state,
        ...action.data,
      };
    case RESET_FILTER:
      return initialState;
    default:
      return state;
  }
};

export default filter;
