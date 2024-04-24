import styled from "styled-components";
import { INTERFACE_MOBILE_BREAKPOINT } from "@const/interface";
import { InterfaceFont, InterfaceTextColor } from "@type/interface";

export const Wrapper = styled.div`
  margin-top: 20px;
  list-style: none;
  @media ${INTERFACE_MOBILE_BREAKPOINT} {
    margin-top: 40px;
  }
`;

export const Item = styled.div`
  display: flex;
  align-items: center;
  color: #fff;
  font-family: ${InterfaceFont.PIXEL_LABEL};
  &:not(:last-child) {
    margin-bottom: 15px;
  }
`;

export const Value = styled.div`
  margin-top: -3px;
  font-size: 26px;
  line-height: 26px;
`;

export const Label = styled.div`
  margin-left: 10px;
  font-size: 16px;
  line-height: 16px;
`;

export const Record = styled.div`
  margin-left: 15px;
  font-size: 12px;
  line-height: 12px;
  color: ${InterfaceTextColor.SUCCESS};
`;
