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

import store, { AppThunk } from  '../store';  // REVIEW: Are there any anti-patterns associated with thunks being state-aware?
import { Fetch } from '../utils/Fetch';
import { recordDelta } from '../utils/utils';
import  { metaload, load, 
          refreshVMfromAuditRecords,
          refreshRecordInVM, 
          addRecordToVM, 
          deleteRecordFromVM
        } from './ModelSlice';
import { INavigateState, setFocus } from '../features/SystemNavigator/NavigateSlice';
import { SettingsState, setOutlineFilters } from '../features/SettingsPage/SettingsSlice';
import { RecordOfAnyType } from './ModelTypes';

// Initial settings on load are required by
// buildOutline() that is called by setOutlineFilters()...
const settings : SettingsState = {
  showAdminTables: false, 
  activeFilter:true, 
  paletteType: 'light',
  searchFilter: '',
  expandOutline: false,
  expandCollapseUpdateCounter: 0
}

export const initialLoad = (route:string="all") => 
{
  Fetch(route)
  .then(res => res && res.json())
  .catch(() =>{})
  .then(res => {
    console.time('store.dispatch(load())');
    store.dispatch(load(res));
    console.timeEnd('store.dispatch(load())');
    // Following calls buildOutline() to complete 
    // setup of initial redux state...
    console.time('store.dispatch(setOutlineFilters())');
    store.dispatch(setOutlineFilters({ settings }));
    console.timeEnd('store.dispatch(setOutlineFilters())');
    return res;
  });
}

export const loadMetadata = () => 
{
  //console.log('loadMetadata()');
  Fetch('meta')
  .then(res => res && res.json())
  .catch(() =>{})
  .then(res => {
      store.dispatch(metaload(res));
      return res;
  });
}

export const updateRecord = 
  (navigate:INavigateState, settings:SettingsState, recordDelta:any) 
    : AppThunk => async dispatch => 
{
  const { navTable, navTableID } = navigate;

  let record : RecordOfAnyType = {};

  if (Object.keys(recordDelta).length) {
    await Fetch(navTable + '/' + navTableID, {
        method: 'PUT',
        body: JSON.stringify(recordDelta),
        headers: { 'Content-Type': 'application/json' }
    })
    .then(res => res && res.json())
    .catch(() =>{/*Fetch handles user alert; avoid node exception*/})
    .then(res => {
      // Grab committed record from server that will be populated with
      // any other fields computed server-side... 
      record = res;
      dispatch(refreshRecordInVM({navigate,settings,record}));
    });
  }
}

let fetchInProgress = false;

export const refreshFromServer = (settings:SettingsState) =>
//  : AppThunk => async dispatch => 
{
  // REVIEW: Not using 'store' may not be SSR compatible?  Not that it needs to be....
  const lastAuditTableID = store.getState().model.lastAuditTableID; 

  if (!fetchInProgress) {
    fetchInProgress = true;
    Fetch(`audit_updates/${lastAuditTableID}`)
    .then(res => res && res.json())
    .catch(() => { fetchInProgress = false; } )
    .then(res => {
        const audit_updates: any = res;
        fetchInProgress = false;
        if (audit_updates?.length) {
          store.dispatch(refreshVMfromAuditRecords({settings,audit_updates}));
        }

        //
        // MINOR HACK: Watch for any edits to metadata tables,
        // either by ourself or other users, and reload
        // the denormalized-keys metaData in Redux...
        //
        if (audit_updates?.length && 
            (audit_updates[0].table_name==='AppTable' 
            || audit_updates[0].table_name==='AppColumn')) {
          loadMetadata();
        }

        return res;
    });
  }
}

export const insertRecord = 
  (navigate:INavigateState, settings:SettingsState, _record:RecordOfAnyType)
    : AppThunk => async dispatch => 
{
  const { navTable } = navigate;

  // HACK: XREF - I have a business rule in recordDelta that filters out 
  // derived key fields...  I may move the rule elsewhere later...
  let record = recordDelta(_record,{}); 

  if (Object.keys(record).length) {
    await Fetch(navTable, { 
      method: 'POST', 
      body: JSON.stringify(record),
      headers: { 'Content-Type': 'application/json' }                        
    })
    .then(res => res && res.json())
    .catch(() =>{/*Fetch handles user alert; avoid node exception*/})
    .then(res => {
      // Grab committed record from server that will be populated with
      // a primary key field, and any other fields computed server-side... 
      record = res; 

      // TODO: (Story logged) Why is following exception masked 
      //       even if .catch(), below, commented out!!!!!!!!!!!
      // throw 123;

      dispatch(addRecordToVM({navigate,settings,record}));
    })
  }
}

export const deleteRecord = (navigate: INavigateState, settings: SettingsState)
  : AppThunk => async dispatch => 
{
  const { navTable, navTableID } = navigate;
  let err = false;

  await Fetch(navTable + '/' + navTableID,
      { method: 'DELETE' }
  ).then().catch((error) =>{ err = true; });

  if (!err) {
    dispatch(deleteRecordFromVM({navigate,settings}));
    dispatch(
      setFocus({
        table: "",
        tableID: "",
        parentTable: "",
        parentID: "",
      })
    ); 
  }
}
