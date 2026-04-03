import type { ReactNode } from "react";
import { Component } from "react";

type Props = {
  children: ReactNode;
};

type State = {
  hasError: boolean;
};

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  public override render(): ReactNode {
    if (this.state.hasError) {
      return (
        <section className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-800">
          Something went wrong while rendering this screen.
        </section>
      );
    }

    return this.props.children;
  }
}
