import { h, Component } from 'preact';
import styled from 'styled-components';

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
						<Form>
							<Row>
								Github Username: <TextBox />
							</Row>
							<Row>
								Repository Name: <TextBox />
							</Row>
							<Row submit>
								<Submit>
								Submit
								</Submit>
							</Row>
						</Form>
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
	padding-left: 8%;
	padding-right: 5%;
	align-self: stretch;`
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

const Form = styled.form`
	display: flex;
	flex-direction: column;
	flex-basis: 100%;
	align-items: stretch;
`;

const Row = styled.div`
	display: flex;
	flex-direction: row;
	align-items: center;
	justify-content: ${props => props.submit ? 'center' : 'flex-end'};
	white-space: nowrap;
`;

const TextBox = styled.input`
	display: inline-flex;
	border-radius: 12px;
	box-shadow: 0 0.4rem 0.8rem -0.1rem rgba(0,32,128,.1), 0 0 0 1px #f0f2f7;
	height: 20px;
	padding: 10px;
	margin: 20px;
	border: none;
	display: flex;
	flex-basis: 80%;
`;

const Submit = styled.div`
	display: flex;
	background: #FAFAFA;
	border-radius: 50px;
	line-height: 1.8;
	overflow: hidden;
	font-size: 20px;
	color: #E27D60;
	align-self: center;
	margin-bottom: 15px;
	&:hover {
		font-weight: bold;
		cursor: pointer;
	}`
;

export default NewProject;
