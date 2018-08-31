import { h, Component } from 'preact';
import styled from 'styled-components';
import axios from 'axios';
<<<<<<< HEAD
import MediaQuery from 'react-responsive';
=======
import Emoji from 'react-emoji-render';
>>>>>>> bcfd722... Added emoji support

import Icon from '../Icon';
import Info from './Info';

class ProjectCard extends Component {
	constructor(props) {
		super(props);
		this.state = {
			project: props.project,
			stars: 0,
			watchers: 0,
			contributors: 0
		};
	}

	async componentDidMount() {
		const { project } = this.state;

		const url = `/api/project/getStatistics?owner=${project.owner}&repo=${project.name}`;
		// Get stars and contributors for single project
		const response = await axios.get(url);
		const data = response.data.data;
		this.setState({
			stars: data.stars,
			watchers: data.watchers,
			contributors: data.contributors
		});
	}

	render () {
		const { stars, contributors } = this.state;
		const { name, description, url, twitter } = this.state.project;

		const twitterURL = (handle) => `https://twitter.com/${handle}`;

		return (
			<div>
				<MediaQuery minDeviceWidth={1224}>
					<Card>
						<Meta>
							<TitleWrapper>
								<Title>
									<Link href={url}>
										{name}
									</Link>
								</Title>
								<div style={styles.iconContainer}>
									<a href={twitterURL(twitter)} target="_blank" rel="noopener noreferrer">
										<Icon type={'twitter'} width={30} height={30} style={styles.twitter} />
									</a>
								</div>
							</TitleWrapper>
							<Emoji text={description} />
						</Meta>
						<Info stars={stars} contributors={contributors} />
					</Card>
				</MediaQuery>
				<MediaQuery maxDeviceWidth={1224}>
					<Card mobile>
						<Meta mobile>
							<Title mobile>
								<Link href={url}>
									{name}
								</Link>
							</Title>
							<Description text={description} />
						</Meta>
						<Info stars={stars} contributors={contributors} />
					</Card>
				</MediaQuery>
			</div>
		);
	}
}

const styles = {
	iconContainer: {
		display: 'flex',
		alignItems: 'center',
		flexBasis: '100%',
		alignSelf: 'center',
		marginLeft: '15px'
	},
	twitter: {
		cursor: 'pointer'
	}
};

const Card = styled.div`
	position: relative;
	background: #fff;
	padding: 4% 8%;
	border-radius: 12px;
	box-shadow: 0 0.4rem 0.8rem -0.1rem rgba(0,32,128,.1), 0 0 0 1px #f0f2f7;
	line-height: 1.8;
	margin-bottom: 20px;
	height: 10rem;
	overflow: hidden;
	display: flex;
	align-items: center;
	justify-content: space-around
	font-size: ${props => props.mobile ? '12px' : '18px'};
	flex-direction: ${props => props.mobile ? 'column' : 'row'};
	`
;

const Meta = styled.div`
	display: flex;
	flex: 1;
	flex-direction: column;
	flex-basis: 70%;
	${props => props.mobile && 'align-self: flex-start'}; 
	text-align: left;
`;

const TitleWrapper = styled.div`
	display: flex;
`;

const Title = styled.h2`
	display: flex;
	flex: 1;
	text-decoration: underline;
	font-family: Courier New;
	${props => props.mobile && 'max-height: fit-content'};
	${props => props.mobile && 'flex-basis: 0'};
`;

const Description = styled(Emoji)`
	display: flex;
`;

const SubTitle = styled.h4`
	display: flex;
	text-decoration: none !important;
	flex: 1;
	font-family: Comic Sans MS;
	text-align: left;
`;

const Link = styled.a`
	display: flex;
	color: #E27D60;
	flex: 1;
	&:hover {
		color: grey;
	}
`;

export default ProjectCard;
