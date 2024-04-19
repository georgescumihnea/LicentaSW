import { configureStore } from "@reduxjs/toolkit";
import headerSlice from "./headerSlice";

const combinedReducer = {
  header: headerSlice,
};

export default configureStore({
  reducer: combinedReducer,
});
