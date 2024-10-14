const UPDATE_FILTER = 'UPDATE_FILTER';
const RESET_FILTER = 'RESET_FILTER';
const TOGGLE_USE_PREFERENCES = 'TOGGLE_USE_PREFERENCES';

export const updateFilter = (filterData) => ({
  type: UPDATE_FILTER,
  data: filterData,
});

export const resetFilter = () => ({
  type: RESET_FILTER,
});

export const toggleUsePreferences = (value: boolean) => ({
  type: TOGGLE_USE_PREFERENCES,
  value,
});

const initialState = {
  traitPreferences: {},
  searchText: '',
  sortOption: 'nameAsc',
  usePreferences: false,
  breedGroup: null,
  lifeSpan: [0, 20],
  weight: [0, 100],
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
    case TOGGLE_USE_PREFERENCES:
      return {
        ...state,
        usePreferences: action.value,
      };
    default:
      return state;
  }
};

export default filter;
