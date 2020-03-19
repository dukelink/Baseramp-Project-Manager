/*
    Baseramp Project Manager - An open source Project Management software built
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

import React, { MutableRefObject, memo } from 'react';
import { NodeForm, NodeFormEditState_OnChange } from './NodeForm';
import { useSelector } from 'react-redux';
import { RootState } from '../../rootReducer'; 
import { RecordOfAnyType, useInitializedRecord } from '../../model/ModelSlice';

export const NodeFormView = 
// NOTE: Memoization is required to prevent loss of state (edits) 
//       when switching between Outline and Edit modes 
//       (modes used on mobile form factors).
memo( 
    (props:{nodeFormCallbackRef: MutableRefObject<NodeFormEditState_OnChange>}) => {
    const { nodeFormCallbackRef } = props;
    const state = useSelector<RootState,RootState>(state=>state);
    let { navTable, navTableID, navParentTable, navStrParentID } = state.navigate;
    const viewModel = state.model.apiModel;
    const initialRecord : RecordOfAnyType = useInitializedRecord(navTable); // TODO: should we memoize?

    console.log(
        `<NodeFormView/> navTable: ${navTable},`
        + ` navTableID: ${navTableID},`
        + ` initialRecord = ${JSON.stringify(initialRecord)}` );

    // HACK: XREF FEATURE...
    // handle xref derived (hyphenated) table names by return parent table info...

    if (navTable.split('~').length>1) 
    {
        navTable = navTable.split('~')[0];    
        navTableID = navTableID.split('~')[0]; // xref support
    }
    // HACK: ...XREF FEATURE

    let record : RecordOfAnyType = {};
    if (navTable) { 
        if (navTableID!=="-1") 
            record = viewModel[navTable][navTableID];
        else {
            record = {...initialRecord};
            if (navParentTable && navStrParentID) {
                // HACK: XREF FEATURE...
                navParentTable = navParentTable.split('~')[0];  
                navStrParentID = navStrParentID.split('~')[0];
                // HACK: ...XREF FEATURE
                record[navTable + '_' + navParentTable + '_id'] = navStrParentID;
            }
        }
    }

    if (navTable && navTableID) {
        return <NodeForm 
            navTable = { navTable } 
            navTableID = { navTableID }
            record = { record } 
            onChange = { (rec)=>nodeFormCallbackRef.current(rec) } />
    }

    return <></>;
});

