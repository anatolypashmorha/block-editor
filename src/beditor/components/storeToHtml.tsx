import {
    Mjml,
    MjmlBody, MjmlButton,
    MjmlColumn,
    MjmlHead,
    MjmlImage,
    MjmlPreview,
    MjmlSection,
    MjmlStyle, MjmlText,
    MjmlTitle
} from "@faire/mjml-react"

import { renderToMjml } from "@faire/mjml-react/utils/renderToMjml";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import mjml2html from 'mjml-browser';
import { MJMLParseResults } from 'mjml-core';
import React from "react";

export const StoreToHtml = () => {
    const {html, errors} = renderReactToMjml(<StoreToMjml/>);
    if (errors.length > 0) {
        console.log(errors);
    }
    return html;
}
export function renderReactToMjml(email: React.ReactElement): MJMLParseResults {
    return mjml2html(renderToMjml(email));
}

export const StoreToMjml = () => {
    return (
        <Mjml>
            <MjmlHead>
                <MjmlTitle>Last Minute Offer</MjmlTitle>
                <MjmlPreview>Last Minute Offer...</MjmlPreview>
                <MjmlStyle>{`
                  .blue-column {
                    background-color: blue;
                  }
                `}</MjmlStyle>
                        <MjmlStyle inline>{`
                  .red-column {
                    background-color: red;
                  }
                `}</MjmlStyle>
            </MjmlHead>
            <MjmlBody width={500}>
                <MjmlSection fullWidth backgroundColor="#efefef">
                    <MjmlColumn>
                        <MjmlImage src="https://static.wixstatic.com/media/5cb24728abef45dabebe7edc1d97ddd2.jpg" />
                    </MjmlColumn>
                </MjmlSection>
                <MjmlSection>
                    <MjmlColumn>
                        <MjmlButton padding="20px" backgroundColor="#346DB7" href="https://www.wix.com/">
                            I like it!
                        </MjmlButton>
                    </MjmlColumn>
                </MjmlSection>
                <MjmlSection>
                    <MjmlColumn cssClass="blue-column">
                        <MjmlText>I am blue</MjmlText>
                    </MjmlColumn>
                    <MjmlColumn cssClass="red-column">
                        <MjmlText>I am red</MjmlText>
                    </MjmlColumn>
                </MjmlSection>
                <MjmlSection>
                    <MjmlColumn>
                        <MjmlText><a href="/2">Open Second Template</a></MjmlText>
                    </MjmlColumn>
                </MjmlSection>
            </MjmlBody>
        </Mjml>
    )
}
