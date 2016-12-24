const SET_FLAGS = `@@FEATURE_FLAG/SET`;

export default payload => ({
  type: SET_FLAGS,
  payload,
});
