import * as React from 'react';
import ConfigList from 'src/ConfigList';
import { receivedData } from 'src/data/actions';
import { connect, pickProperties } from 'src/redux';
import { ConfigLocation, FileSystemConfig, formatConfigLocation, groupByGroup, groupByLocation } from 'src/types/fileSystemConfig';
import { IStartScreenState } from 'src/view';
import { openNewConfig, openStartScreen } from 'src/view/actions';
import { API } from 'src/vscode';
import './index.css';

interface StateProps {
    configs: FileSystemConfig[];
    groupBy: string;
}
interface DispatchProps {
    refresh(): void;
    changeGroupBy(current: string): void;
    add(): void;
}
class Homescreen extends React.Component<StateProps & DispatchProps> {
    public componentDidMount() {
        this.props.refresh();
    }
    public render() {
        const grouped = (this.props.groupBy === 'group' ? groupByGroup : groupByLocation)(this.props.configs);
        grouped.sort((a, b) => a[0] > b[0] ? 1 : -1);
        const nextGroupBy = this.props.groupBy === 'group' ? 'location' : 'group';
        return <div className="Homescreen">
            <h2>Configurations</h2>
            <button onClick={this.props.refresh}>Refresh</button>
            <button onClick={this.props.add}>Add</button>
            <button onClick={this.changeGroupBy}>Sort by {nextGroupBy}</button>
            {grouped.map(([loc, configs]) => this.createGroup(loc, configs))}
        </div>;
    }
    public createGroup(group: string | ConfigLocation, configs: FileSystemConfig[]) {
        const title = this.props.groupBy === 'group' ? group : formatConfigLocation(group as ConfigLocation);
        return <div key={group}>
            <h3>{title}</h3>
            <ConfigList configs={configs} />
        </div>;
    }
    public changeGroupBy = () => this.props.changeGroupBy(this.props.groupBy);
}

export default connect(Homescreen)<StateProps, DispatchProps>(
    state => ({
        ...pickProperties(state.data, 'configs'),
        ...pickProperties(state.view as IStartScreenState, 'groupBy'),
    }),
    dispatch => ({
        add: () => dispatch(openNewConfig()),
        changeGroupBy: (current: string) => dispatch(openStartScreen(current === 'group' ? 'location' : 'group')),
        refresh: () => (dispatch(receivedData([], [])), API.postMessage({ type: 'requestData' })),
    }),
);
