import { h, Component } from 'preact';
import styled from 'styled-components';
import axios from 'axios';

class Form extends Component {
	constructor (props) {
		super(props);
		this.state = {
			repo: '',
			twitter: '',
			fetching: false,
			success: false,
			possibleRepos: [],
			allRepos: [],
			showSug: false
		};
	}

	_setFormValue = e => {
		this.setState({
			[e.target.name]: e.target.value
		});
		this._filterRepos(e.target.value);
	}

	_filterRepos = (repoSugs) => {
		this.setState({ possibleRepos: this.allRepos.filter(project => project.name.includes(repoSugs)) });
	}

	_getRepos = () => {
	  axios.get('/api/project/getRepos')
			.then((response) => {
				this.setState({ allRepos: response.data.data });
			})
			.catch((err) => {
				console.log(err);
			});
	}

	_addRepo(repoSug) {
		this.setState({ repo: repoSug });
	}

	_submitForm = async () => {
		const { repo, twitter } = this.state;
		this.setState({ fetching: true });

		await axios.post('/api/project/add', {
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

	render({ mobile }, { owner, repo, twitter, fetching, success, possibleRepos, showSug }) {
		this._getRepos();
		return (
			<FormContainer onSubmit={this._submitForm} action="javascript:" mobile>
				<Row mobile>
				Repository Name:
					<TextBox
						value={repo}
						onInput={this._setFormValue}
						name="repo"
						placeholder="e.g. standard"
						mobile
						isSuggesting={showSug}
						onFocus={() => this.setState({ showSug: true})}
						onBlur={() => this.setState({ showSug: false})}
					/>
					<Suggestions
						isSuggesting={showSug}
					>
						{possibleRepos.length !== 0 && showSug ? (
							possibleRepos.map(repoSug => (
								<Suggestion onClick={this._addRepo(repoSug)}> {repoSug.name} </Suggestion>
							))
						) : ( <p /> )}
					</Suggestions>
				</Row>
				<Row mobile>
				Twitter Handle:
					<TextBox
						value={twitter}
						onInput={this._setFormValue}
						name="twitter"
						placeholder="e.g. feross"
						mobile
						isSuggesting={false}
					/>
				</Row>
				<Row submit mobile>
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
	${props => props.mobile && 'padding: 10px 0'};
`;

const Row = styled.div`
	display: flex;
	align-items: ${props => props.mobile ? 'stretch' : 'center'};
	justify-content: ${props => props.submit ? 'center' : 'space-between'};
	${props => props.submit && 'flex-basis: 15%' };
	${props => props.submit && 'margin-top: 15px' };
	flex-direction: ${props => props.mobile ? 'column' : 'row'};
	white-space: nowrap;
`;

const Text = styled.h5`
	margin: 0;
`;

const TextBox = styled.input`
	display: inline-flex;
	${props => props.isSuggesting ? 'border-radius: 12px 12px 0 0;' : 'border-radius: 12px;'}
	box-shadow: 0 0.4rem 0.8rem -0.1rem rgba(0,32,128,.1), 0 0 0 1px #f0f2f7;
	height: 20px;
	padding: 10px;
	margin: 10px 20px;
	border: none;
	display: flex;
	flex-basis: ${props => props.mobile ? '100%' : '60%'};
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
	margin-bottom: 12.5px;
	&:hover {
		font-weight: bold;
		cursor: pointer;
	}
	&:active {
		outline: 0;
	}`
;

const Suggestions = styled.ul`
	list-style-type: none;
	padding: 0;
	${props => props.isSuggesting ? 'display: flex;' : 'display: none;'}
	flex-direction: column;
	justify-content: center;
	align-content: center;
	margin: -10px 20px -30px 20px;
	-webkit-flex-basis: 100%;
	-ms-flex-preferred-size: 100%;
	flex-basis: 100%;
	background: white;
	border-radius: 0 0 12px 12px;
	box-shadow: 0 0.4rem 0.8rem -0.1rem rgba(0,32,128,.1),0 0 0 1px #f0f2f7;
	z-index: 666;
`
;

const Suggestion = styled.li`
	border-top: 1px solid rgba(0, 0, 0, 0.3);
	text-align: center;
	border-radius: 0 0 12px 12px;
	&:hover {
		background: #EEE;
		cursor: pointer;
	}
`
;


export default Form;
