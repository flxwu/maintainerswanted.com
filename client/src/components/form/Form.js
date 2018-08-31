import { h, Component } from 'preact';
import styled from 'styled-components';
import axios from 'axios';

import Icon from '../Icon';

class Form extends Component {
	constructor (props) {
		super(props);
		this.state = {
			owner: '',
			repo: '',
			twitter: '',
			fetching: false,
			success: false
		};
	}

	setFormValue = e => {
		this.setState({
			[e.target.name]: e.target.value
		});
	}
	
	_submitForm = async () => {
		const { owner, repo, twitter } = this.state;
		this.setState({ fetching: true });

		await axios.post('/api/project/add', {
			owner,
			repo,
			twitter
		})
			.then((response) => {
				if (response.status === 200) {
					this.setState({ fetching: false, success: true });
				}
			})
			.catch((error) => {
				this.setState({ fetching: 'error' });
				console.error(error);
			});
	};

	render({ }, { owner, repo, twitter, fetching, success }) {
		return (
			<FormContainer onSubmit={this._submitForm} action="javascript:">
				<Row>
				Github Username:
					<TextBox
						value={owner}
						onInput={this.setFormValue}
						name="owner"
						placeholder="e.g. feross"
					/>
				</Row>
				<Row>
				Repository Name:
					<TextBox
						value={repo}
						onInput={this.setFormValue}
						name="repo"
						placeholder="e.g. standard"
					/>
				</Row>
				<Row>
				Twitter Handle:
					<TextBox
						value={twitter}
						onInput={this.setFormValue}
						name="twitter"
						placeholder="e.g. feross"
					/>
				</Row>
				<Row submit>
					<Submit type="submit"> Submit </Submit>
				</Row>
				{ success &&
					<Text>
						Project successfully added!
					</Text>
				}
			</FormContainer>
		);
	}
}

const FormContainer = styled.form`
	display: flex;
	flex-direction: column;
	flex-basis: 100%;
	align-items: stretch;
`;

const Row = styled.div`
	display: flex;
	flex-direction: row;
	align-items: center;
	justify-content: ${props => props.submit ? 'center' : 'space-between'};
	${props => props.submit && 'flex-basis: 15%' };
	white-space: nowrap;
`;

const Text = styled.h5`
	margin: 0;
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
	flex-basis: 60%;
`;

const Submit = styled.input`
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
	}
	&:active {
		outline: 0;
	}`
;

export default Form;