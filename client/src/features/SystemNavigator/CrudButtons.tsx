/*
    Baseramp Tracker - An open source Project Management software built
    as a Single Page Application (SPA) and Progressive Web Application (PWA) using
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

import React, { useState, Dispatch, SetStateAction } from 'react';

import { Grid, IconButton } from '@material-ui/core';
import { Button } from '@material-ui/core';
import PlayCircleFilledIcon from '@material-ui/icons/PlayCircleFilled';
import { useNavPanelStyles } from './SystemNavigatorStyles';

import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../rootReducer'; 
import { NodeFormEditState } from '../NodeForm/NodeForm';
import { EditMode } from './SystemNavigator';
import { updateRecord, insertRecord, deleteRecord } from '../../model/ModelThunks';
import { addNewBlankRecordForm, setFocus } from './NavigateSlice';

import { recordDelta } from '../../utils/utils';

import { RecordOfAnyType } from '../../model/ModelTypes';

export const CrudButtons = ( props: {
    latestNodeformState: NodeFormEditState,
    setLatestNodeformState: Dispatch<SetStateAction<NodeFormEditState>>,
    mode: EditMode, setMode: Dispatch<SetStateAction<EditMode>>,
    origRecord: RecordOfAnyType
  } 
) => {
  const { setLatestNodeformState, mode, setMode, origRecord } = props;
  const { record, isFormValid } = props.latestNodeformState;      

  const classes = useNavPanelStyles();
  const state = useSelector<RootState,RootState>(state=>state);
  const dispatch = useDispatch();
  const [ rerenderFlag, setRerenderFlat ] = useState(1);
  const otherMode = mode==='Outline' ? 'Edit' : 'Outline';
  const otherLabel = mode==='Outline' ? 'Form' : 'Outline';

  const { navTable, navTableID, navParentTable, navStrParentID } = state.navigate;

  return (
    <Grid item xs = {12} 
          className = { classes.OutlineEditButton } 
          style = {{ display: navTable ? 'inline-block' : 'none'  }}> 
      <Grid item xs = {12} 
          className = { classes.OutlineEditButton } 
          style = {{ display: navTable ? 'inline-block' : 'none'  }}> 
        <div 
              color='secondary'
              style = {{ 
                width: '100%', 
                visibility: navTable ? 'visible' : 'hidden' }}>
          { 
            (mode !== "Both" && navTableID ) &&
              <IconButton area-label="Navigation Outline"
                  style = {{ padding: 6 }} 
                  onClick = { () => { setMode(otherMode) } }>
                <div>
                  { otherLabel }&nbsp;
                </div> 
                <PlayCircleFilledIcon className = { 
                  otherMode==='Outline' ? classes.rotate80 : '' 
                } />
              </IconButton>
          }
          <div  className = { classes.buttonBar }
                style = {{ display: 'inline-block', float: 'right' }} >
            { ( ( !navTableID 
                  || JSON.stringify(origRecord)===JSON.stringify(record) )
                && navTableID!=='-1') ? <>
              <Button 
                  variant='contained' 
                  onClick = { () => {
                      dispatch(addNewBlankRecordForm({navTable}));
                      console.log(mode);
                      setMode(mode==='Both'?mode:'Edit'); 
                  } } >
                  Add New
                  { (navTable===navParentTable ? ' Sub-' : ' ') // HACK: CYCLIC RELATIONSHIPS
                    + navTable 
                  }
              </Button> 

              { navTableID &&
                <Button 
                  id="crudDelete" 
                  variant='contained' 
                  onClick={ () => {
                    dispatch(deleteRecord(state.navigate));
                    setMode(mode==='Both'?mode:'Outline');
                  } } > 
                  Delete 
                </Button>                
              }
            </> : 
            navTableID && <>
              <Button
                  id="crudSave" 
                  variant='contained' 
                  disabled={ !isFormValid }
                  onClick={ () => {
                      if (!isFormValid) {
                          alert('Please fill in all required fields before saving');
                          return;
                      }
                      if (navTableID==="-1") 
                          dispatch(insertRecord(state.navigate, record));
                      else
                          dispatch(updateRecord(state.navigate,
                              recordDelta(record, origRecord)));                 
              }}> Save </Button> 
              <Button 
                  id="crudCancel" variant='contained'
                  onClick={ ()=> { 
                    setLatestNodeformState({ 
                      record: origRecord, 
                      isFormValid: true
                    });
                    // Remove form if Add New record form...
                    if (navTableID === '-1') {
                      dispatch(setFocus({ 
                        table:navTable, 
                        tableID: '', 
                        parentTable: navParentTable,
                        parentID: navStrParentID 
                      }));
                      // Return to outline display only...
                      setMode('Outline');
                    } else
                    // If user was editing an existing record, flag rerender...
                      setRerenderFlat(rerenderFlag+1);  
                  }
              }> Cancel </Button>
            </>}
          </div>
        </div>
      </Grid> 

    </Grid> 
  )
}