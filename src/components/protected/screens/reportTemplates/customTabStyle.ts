import styled from 'styled-components';
import { styled as styledTabTab } from 'react-tabtab';

let { TabListStyle, ActionButtonStyle, TabStyle, PanelStyle } = styledTabTab;

ActionButtonStyle = styled(ActionButtonStyle)`
  height: 100%;
  text-align: center;
  border-radius: 0;
  background: #f9f9f9;
  border: solid 1px #eee;
  > svg {
    padding-top: 10px;
    width: 25px;
    height: auto;
  }
`;

module.exports = {
  TabList: TabListStyle,
  ActionButton: ActionButtonStyle,
  Tab: TabStyle,
  Panel: PanelStyle
}