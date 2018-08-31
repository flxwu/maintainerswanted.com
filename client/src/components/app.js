import { h, Component } from 'preact';
import styled from 'styled-components';
import axios from 'axios';

import ProjectCard from './project/ProjectCard';
import NewProject from './form/NewProject';
import Header from './Header';
import Loading from './Loading';

export default class App extends Component {
	constructor(props) {
		super(props);
		this.state = {
			projects: []
		};

		// accessibility: add outline if tab is used
		if (typeof window !== 'undefined') {
			const handleFirstTab = (e) => {
				if (e.keyCode === 9) {
					document.body.classList.add('user-is-tabbing');
					window.removeEventListener('keydown', handleFirstTab);
				}
			};
    
			window.addEventListener('keydown', handleFirstTab);
		}
    
		if (typeof document !== 'undefined') {
			document.title = 'Maintainers Wanted';
		}
    
	}

	async componentDidMount() {
		// get projects list
		const response = await axios.get('/api/project/getList');
		const dataObject = response.data.data[0];
		const data = Object.keys(dataObject)
			.map(dbKey => dataObject[dbKey]);
    
		this.setState({ projects: data });
	}

	render() {
		const { projects } = this.state;
		return (
			<div>
				<Header />
				<List mobile>
					<NewProject />
					{projects.length !== 0 ?
						projects.map(project => (
							<ProjectCardWrapper>
								<ProjectCard project={project} />
							</ProjectCardWrapper>)
						) :
						<Loading />
					}
				</List>
				<FooterWrapper>
					<Footer>
            Made with love by
						<Link href="https://twitter.com/flxwu"> @flxwu</Link> and
						<Link href="https://twitter.com/QuentinOschatz"> @Qo2770</Link>
					</Footer>
				</FooterWrapper>
			</div>
		);
	}
}

const List = styled.ul`
  display: block;
  margin-block-start: 3em;
  margin-block-end: 1em;
  margin-inline-start: 0px;
  margin-inline-end: 0px;
  padding-inline-start: 20%;
  -webkit-padding-start: 20%;
  padding-inline-end: 20%;
  -webkit-padding-end: 20%;
  list-style-type: none;
  background: #FAFAFA;
  text-align: center;
`;

const FooterWrapper = styled.div`
  display: flex;
  justify-content: center;
  background: #FAFAFA;
  height: 20px;
  margin: 50px 0;
`;

const Footer = styled.div`
  position: relative;
`;

const ProjectCardWrapper = styled.li`
  position: relative;
  flex: 1;
`;

const Link = styled.a`
  text-decoration: none;
  font-weight: bold;
  color: #E27D60;
  &:hover { 
    color: grey; 
  } 
`;
