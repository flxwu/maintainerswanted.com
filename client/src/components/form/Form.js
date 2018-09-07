import { h, Component } from 'preact';
import styled from 'styled-components';
import Icon from '../Icon';
import axios from 'axios';

class Form extends Component {
  constructor (props) {
    super(props);
    this.state = {
      repo: '',
      twitter: '',
      fetching: true,
      success: false,
      filteredReposList: [
        {
          repo: 'Loading...'
        }
      ],
      reposList: [],
      showAutoComplete: false,
      selectedIndexFromDropdown: -1
    };

    this._toggleAutoComplete = this._toggleAutoComplete.bind(this);
    this._handleKeyOnRepoSelect = this._handleKeyOnRepoSelect.bind(this);
  }

  async componentDidMount () {
    await axios.get('/api/project/getRepos').then(response => {
      this.setState({
        reposList: response.data.data,
        filteredReposList: [],
        fetching: false
      });
    });
  }

  shouldComponentUpdate (nextProps, nextState) {
    return JSON.stringify(this.state) !== JSON.stringify(nextState);
  }

  _setFormValue = async e => {
    if (e.target.name === 'repo') {
      let targetVal = e.target.value;
      let filteredRepos = await this.state.reposList.filter(repo =>
        repo.repo.toLowerCase().includes(targetVal.toLowerCase())
      );

      filteredRepos.sort((repo1, repo2) => repo2.stars - repo1.stars);
      if (filteredRepos.length > 5) filteredRepos = filteredRepos.slice(0, 4);

      this.setState({
        [e.target.name]: targetVal,
        filteredReposList: filteredRepos,
        selectedIndexFromDropdown: -1
      });
    } else {
      this.setState({
        [e.target.name]: e.target.value
      });
    }
  };

  _submitForm = async () => {
    const { repo, twitter } = this.state;
    this.setState({ fetching: true });

    await axios
      .post('/api/project/add', {
        repo,
        twitter
      })
      .then(response => {
        if (response.status === 200) {
          this.setState({ fetching: false, success: true });
        }
      })
      .catch(error => {
        this.setState({ fetching: 'error', success: false });
        console.error(error);
      });
  };

  _toggleAutoComplete (toggle) {
    this.setState({
      showAutoComplete: toggle
    });
  }

  _handleKeyOnRepoSelect (event) {
    switch (event.key) {
      case 'ArrowDown': {
        if (!this.state.fetching) {
          if (
            this.state.selectedIndexFromDropdown <
            this.state.filteredReposList.length
          ) {
            this.setState({
              selectedIndexFromDropdown:
                this.state.selectedIndexFromDropdown + 1,
              repo: 
                this.state.filteredReposList[this.state.selectedIndexFromDropdown + 1].repo
            });
          }
        }
        break;
      }
      case 'ArrowUp': {
        if (this.state.selectedIndexFromDropdown >= 0) {
          this.setState({
            selectedIndexFromDropdown: this.state.selectedIndexFromDropdown - 1,
            repo: this.state.filteredReposList[this.state.selectedIndexFromDropdown - 1].repo
          });
        }
        break;
      }
    }
  }

  render (
    { mobile },
    {
      owner,
      repo,
      twitter,
      fetching,
      success,
      filteredReposList,
      showAutoComplete,
      selectedIndexFromDropdown
    }
  ) {
    return (
      <FormContainer
        onSubmit={this._submitForm}
        action='javascript:'
        autoComplete='off'
        mobile>
        <Row mobile>
          Repository Name:
          <TextBox
            value={repo}
            onInput={this._setFormValue}
            name='repo'
            placeholder='e.g. standard'
            shown={showAutoComplete}
            onFocus={() => this._toggleAutoComplete(true)}
            onBlur={() => this._toggleAutoComplete(false)}
            onKeyUp={this._handleKeyOnRepoSelect}
            mobile={mobile}
          />
          <Suggestions shown={showAutoComplete}>
            {filteredReposList.length !== 0 && showAutoComplete ? (
              filteredReposList.map((repo, index) => (
                <Suggestion
                  onClick={() => this._selectRepo()}
                  focused={selectedIndexFromDropdown === index}>
                  {' '}
                  {repo.repo}{' '}
                </Suggestion>
              ))
            ) : (
              <p />
            )}
          </Suggestions>
        </Row>
        <Row mobile>
          Twitter Handle:
          <TextBox
            value={twitter}
            onInput={this._setFormValue}
            name='twitter'
            placeholder='e.g. feross'
            isSuggesting={false}
            mobile
          />
        </Row>
        <Row submit mobile>
          <Submit type='submit'> Submit </Submit>
          <IconWrapperCollapse onClick={this.props.handleCollapse}>
            <Icon type={mobile ? 'x' : 'arrow-up'} width={30} height={30} />
          </IconWrapperCollapse>
        </Row>
        {success && <Text>Project successfully added!</Text>}
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

const IconWrapperCollapse = styled.div`
  display: flex;
  position: absolute;
  align-self: flex-start;
  right: 0;
  background: #fafafa;
  border-radius: 50px;
  line-height: 1.8;
  overflow: hidden;
  font-size: 16px;
  color: #e27d60;
  align-self: center;
  &:hover {
    box-shadow: 0 0.4rem 0.8rem -0.1rem rgba(0, 32, 128, 0.1), 0 0 0 1px #f0f2f7;
    cursor: pointer;
  }
  &:active {
    outline: none;
  }
`;

const Row = styled.div`
  display: flex;
  align-items: ${props => (props.mobile ? 'stretch' : 'center')};
  justify-content: ${props => (props.submit ? 'center' : 'space-between')};
  flex-direction: ${props => (props.mobile ? 'column' : 'row')};
  ${props =>
    props.submit &&
    `display: flex;
    flex-direction: row !important;
    position: relative;
    flex-basis: 15%;
    margin-top: 15px`};
    white-space: nowrap;
`;

const Text = styled.h5`
  margin: 0;
`;

const TextBox = styled.input`
  display: inline-flex;
  ${props =>
    props.shown
      ? 'border-radius: 12px 12px 0 0;'
      : 'border-radius: 12px;'} box-shadow: 0 0.4rem 0.8rem -0.1rem rgba(0,32,128,.1), 0 0 0 1px #f0f2f7;
  height: 20px;
  padding: 10px;
  margin: 10px 20px;
  border: none;
  display: flex;
  flex-basis: ${props => (props.mobile ? '100%' : '60%')};
`;

const Submit = styled.input`
  display: flex;
  background: #fafafa;
  border: 0;
  line-height: 1.8;
  overflow: hidden;
  font-size: 20px;
  color: #e27d60;
  align-self: center;
  &:hover {
    font-weight: bold;
    cursor: pointer;
  }
  &:active {
    outline: 0;
  }
`;

const Suggestions = styled.ul`
  list-style-type: none;
  padding: 0;
  ${props =>
    props.shown ? 'display: flex;' : 'display: none;'} flex-direction: column;
  justify-content: center;
  align-content: center;
  margin: -10px 20px -30px 20px;
  -webkit-flex-basis: 100%;
  -ms-flex-preferred-size: 100%;
  flex-basis: 100%;
  background: white;
  border-radius: 0 0 12px 12px;
  box-shadow: 0 0.4rem 0.8rem -0.1rem rgba(0, 32, 128, 0.1), 0 0 0 1px #f0f2f7;
  z-index: 666;
`;

const Suggestion = styled.li`
  border-top: 1px solid rgba(0, 0, 0, 0.3);
  text-align: center;
  ${props => props.focused && 'background: #eee'};
  &:hover {
    background: #eee;
    cursor: pointer;
  }
`;

export default Form;
