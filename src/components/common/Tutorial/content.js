import React from 'react';
import Radium from 'radium';
import { Link } from 'found';
import localizations from '../../Localizations';
import { colors, fonts, metrics } from '../../../theme';

let styles;

export const Hero = ({ content, size = 'BIG' }) => (
  <div style={styles.heroContainer}>
    <h2 style={size === Hero.small ? styles.h2_small : styles.h2}>
      {content}
    </h2>
  </div>
);

Hero.big = 'BIG';
Hero.small = 'SMALL';

export const Page = Radium(({ children }) => (
  <div style={styles.pageContainer}>{children}</div>
));

export const Content = Radium(({ children }) => (
  <div style={styles.contentContainer}>
    <div style={styles.content}>{children}</div>
  </div>
));

Content.Line = ({ i18n, content }) => (
  <p>{i18n ? localizations[i18n] : content}</p>
);

Content.Block = ({ style, children }) => <div style={style}>{children}</div>;

Content.Image = ({ src }) => <img style={styles.img} src={src} alt="" />;

export const Title = ({ i18n, content }) => (
  <h1 style={styles.title}>{i18n ? localizations[i18n] : content}</h1>
);

export const SubTitle = ({ i18n, content }) => (
  <h2 style={styles.subTitle}>{i18n ? localizations[i18n] : content}</h2>
);

const Sep = () => <span style={styles.breadcrumbSeparator}> / </span>;

export const BreadCrumbs = Radium(({ path, isMobileVersion }) => (
  <ul style={styles.breadcrumbList}>
    <li>
      <Link
        to={isMobileVersion ? '/faq-mobile/tutorial' : '/faq/tutorial'}
        style={styles.breadcrumbItem}
      >
        {localizations.tutorial_title}
      </Link>
    </li>
    {path.map((pathStep, index) => (
      <li style={styles.breadcrumbItem} key={index}>
        <Sep />
        {pathStep}
      </li>
    ))}
  </ul>
));

export const Article = Radium(({ children }) => (
  <article style={styles.article}>{children}</article>
));

const commonStyles = {
  h2: {
    textAlign: 'center',
    color: colors.white,
  },
};

styles = {
  heroContainer: {
    backgroundColor: colors.blue,
  },
  pageContainer: {
    display: 'flex',
    flexDirection: 'column',
  },
  contentContainer: {
    display: 'flex',
    justifyContent: 'center',
  },
  content: {
    display: 'flex',
    justifyContent: 'flex-start',
    flexDirection: 'column',
    width: '100%',
    padding: metrics.margin.large,
    '@media (maxWidth: 980px)': {
      width: 980,
    },
  },
  title: {
    fontSize: 26,
    fontWeight: 700,
    marginBottom: 35,
  },
  subTitle: {
    fontSize: 18,
    fontWeight: 700,
    marginTop: 45,
    marginBottom: 15,
  },
  article: {
    border: `1px solid ${colors.lightGray}`,
    padding: 20,
    fontSize: 13,
    lineHeight: '20px',
    '@media (maxWidth: 550px)': {
      padding: 45,
      marginLeft: '-45px',
      marginRight: '-40px',
    },
  },
  h2: {
    ...commonStyles.h2,

    lineHeight: '55px',
    marginTop: 36,
    marginBottom: 50,
    fontWeight: 700,
    fontSize: fonts.size.xl * 2,
  },
  h2_small: {
    ...commonStyles.h2,

    lineHeight: '28px',
    marginTop: 15,
    marginBottom: 20,
    fontWeight: 600,
    fontSize: fonts.size.xl,
  },
  breadcrumbList: {
    display: 'flex',
    marginTop: 40,
    marginBottom: 18,
    '@media (max-width: 550px)': {
      flexDirection: 'column',
    },
  },
  breadcrumbItem: {
    fontSize: 13,
    fontWeight: 700,
    lineHeight: '19px',
    textDecoration: 'none',
    color: colors.darkBlue,
  },
  breadcrumbSeparator: {
    margin: 10,
    fontSize: 14,
    fontWeight: 'bolder',
  },
  img: {
    width: '100%',
    marginTop: 30,
    marginBottom: 25,
  },
};
