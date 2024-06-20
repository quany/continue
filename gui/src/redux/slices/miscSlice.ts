import { PayloadAction, createSlice } from "@reduxjs/toolkit";

export const miscSlice = createSlice({
  name: "misc",
  initialState: {
    takenAction: false,
    serverStatusMessage: "继续启动服务器",
  },
  reducers: {
    setTakenActionTrue: (state) => {
      state.takenAction = true;
    },
    setServerStatusMessage: (state, action: PayloadAction<string>) => {
      state.serverStatusMessage = action.payload;
    },
  },
});

export const { setTakenActionTrue, setServerStatusMessage } = miscSlice.actions;
export default miscSlice.reducer;
