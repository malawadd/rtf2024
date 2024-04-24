import styled from "styled-components";
import { INTERFACE_MOBILE_BREAKPOINT } from "@const/interface";
import { InterfaceTextColor, InterfaceFont } from "@type/interface";

export const Wrapper = styled.div`
  font-family: ${InterfaceFont.PIXEL_TEXT};
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  @media ${INTERFACE_MOBILE_BREAKPOINT} {
    margin-top: 2px;
  }
`;

export const About = styled.div`
  color: rgba(255, 255, 255, 0.75);
  text-align: right;
  white-space: pre-line;
  font-size: 12px;
  line-height: 12px;
  @media ${INTERFACE_MOBILE_BREAKPOINT} {
    font-size: 8px;
    line-height: 8px;
  }
`;

export const Link = styled.a`
  color: #fff;
  pointer-events: all;
  &:hover {
    color: ${InterfaceTextColor.HOVER};
  }
`;

export const Version = styled.div`
  margin-top: 8px;
`;

export const Discord = styled.a`
  margin-top: 10px;
  color: #fff;
  pointer-events: all;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  text-decoration: none;
  font-size: 13px;
  line-height: 13px;
  padding: 5px 9px;
  border-radius: 3px;
  background: #6170c1;
  &:hover {
    background: #111;
  }
  @media ${INTERFACE_MOBILE_BREAKPOINT} {
    padding: 3px 6px;
  }
`;

export const Icon = styled.img`
  width: 16px;
  margin-right: 8px;
  display: inline-block;
`;
