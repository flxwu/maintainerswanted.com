import { h, Component } from 'preact';
import styled from 'styled-components';

import Form from './Form';
import Icon from '../Icon';

class NewProject extends Component {
	constructor(props) {
		super(props);
		this.state = {
			collapsed: true,
			collapseClick: false
		};

		this._handleExpand = this._handleExpand.bind(this);
		this._handleCollapse = this._handleCollapse.bind(this);
		this._onSubmit = this._onSubmit.bind(this);
	}

	_handleExpand(event) {
		if (!this.state.collapseClick) {
			this.setState({ collapsed: false });
		}
		this.setState({ collapseClick: false });
	}

	_handleCollapse(event) {
		this.setState({ collapsed: true, collapseClick: true });
	}

	_onSubmit (event) {

	}

	render () {
		const { collapsed } = this.state;
		return (
			<Card collapsed={collapsed} onClick={this._handleExpand}>
				{collapsed ?
					<IconWrapper>
						<Icon type={'plus'} />
						<Text>Add Project</Text>
					</IconWrapper> :
					<FormWrapper>
						<Form />
						<IconWrapperCollapse onClick={this._handleCollapse}>
							<Icon type={'arrow-up'} />
						</IconWrapperCollapse>
					</FormWrapper>
				}
			</Card>
		);
	}
}

const Card = styled.div`
	background: #FAFAFA;
	border-radius: 12px;
	box-shadow: 0 0.4rem 0.8rem -0.1rem rgba(0,32,128,.1), 0 0 0 1px #f0f2f7;
	line-height: 1.8;
	margin-bottom: 20px;
	overflow: hidden;
	display: flex;
	align-items: center;
	justify-content: space-around;
	font-size: 16px;
	color: #E27D60;
	padding: 0 5%;
	align-self: stretch;
	cursor: ${props => props.collapsed ? 'pointer' : 'default' };`
;

const IconWrapper = styled.div`
	display: flex;
	align-items: center;
`;

const IconWrapperCollapse = styled.div`
	display: flex;
	background: #FAFAFA;
	border-radius: 50px;
	line-height: 1.8;
	overflow: hidden;
	font-size: 16px;
	color: #E27D60;
	align-self: center;
	&:hover {
		box-shadow: 0 0.4rem 0.8rem -0.1rem rgba(0,32,128,.1), 0 0 0 1px #f0f2f7;
		cursor: pointer;
	}
	&:active {
		outline: none;
	}
`;

const Text = styled.p`
	font-size: 25px;
	font-family: Verdana;
	margin: 10px;
`;

const FormWrapper = styled.div`
	display: flex;
	flex-direction: row;
	flex-basis: 100%;
	justify-content: flex-end;
`;

export default NewProject;
