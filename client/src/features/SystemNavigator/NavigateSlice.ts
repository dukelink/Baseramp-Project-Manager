/*
    Baseramp - An end user database system, 
    enabling personal data usage and private data ownership,
    built as a Progressive Web Application (PWA) using
    Typescript, React, and an extensible SQL database model.

    Copyright (C) 2019-2020  William R. Lotherington, III

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { OutlineNode } from '../../model/ModelOutline';

export interface INavigateState {
  navTable: string;
  navTableID: string;
  navParentTable: string;
  navStrParentID: string;
};

let initialState : INavigateState = {
    navTable: "",
    navTableID: "",
    navParentTable: "",
    navStrParentID: ""
}; 

type INavigateRecordFocus = Pick<OutlineNode,'table'|'tableID'|'parentTable'|'parentID'>;

const model = createSlice({
  name: 'common', // critical if reducer logic is shared in other slices!
  initialState,
  reducers: {
    setFocus(state, action: PayloadAction<INavigateRecordFocus>) {
      let { table, tableID, parentTable, parentID } = action.payload;
      // HACK: XREF...
      if (table==='Project Sprint') {
        table = 'project';
        if (tableID && tableID !== '-1' && typeof tableID==='string')
          tableID = tableID.split('-')[0]; // Extract product_id value only
      }
      // ... HACK: XREF
      state.navTable = table||"";
      state.navTableID = (tableID||"").toString();
      state.navParentTable = (parentTable||"");
      state.navStrParentID = (parentID||"").toString();
    },
    addNewBlankRecordForm(state,action:PayloadAction<{navTable:string}>) {
      state.navTable = action.payload.navTable;
      state.navTableID = '-1';
      console.log('ADD NEW BLANK RECORD');
    },
    addRecordToVM(state,action:PayloadAction<{navigate:INavigateState, record:any}>) {
      const { navigate: { navTable }, record } = action.payload;
      state.navTableID = record[navTable+'_id']
        .toString(); // NOTE: navTableID is of type string
    }, 
    deleteRecordFromVM(state,action:PayloadAction) { 
      state.navTableID = '';
    },
    clearModelReducer(state) {
      // Reset everything to initial state, except for meta data which we will retain...
      Object.assign(state, initialState); 
    }    
  }
});

export const { 
  addNewBlankRecordForm, 
  setFocus  
} = model.actions;

export default model.reducer; 
