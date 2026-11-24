import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { Header } from "./Header";

const renderHeader = (route = "/") =>
  render(
    <MemoryRouter initialEntries={[route]}>
      <Header />
    </MemoryRouter>
  );

describe("Header navigation", () => {
  it("shows labeled Library and Recent destinations on every screen size", () => {
    renderHeader();
    const brand = screen.getByRole("link", { name: /ReadEra/ });
    expect(brand).toHaveClass("min-h-11");
    expect(screen.getByRole("link", { name: "Library" })).toHaveAttribute("href", "/");
    expect(screen.getByRole("link", { name: "Recent" })).toHaveAttribute("href", "/timeline");
  });

  it("marks the current destination with aria-current", () => {
    renderHeader("/timeline");
    const recent = screen.getByRole("link", { name: "Recent" });
    const library = screen.getByRole("link", { name: "Library" });

    expect(recent).toHaveAttribute("aria-current", "page");
    expect(library).not.toHaveAttribute("aria-current");
  });

  it("keeps Library marked current on the library route only", () => {
    renderHeader("/");
    expect(screen.getByRole("link", { name: "Library" })).toHaveAttribute(
      "aria-current",
      "page"
    );
    expect(screen.getByRole("link", { name: "Recent" })).not.toHaveAttribute(
      "aria-current"
    );
  });

  it("keeps upload available but secondary, with a named settings control", () => {
    renderHeader();
    const upload = screen.getByRole("link", { name: /Upload/ });
    expect(upload).toHaveAttribute("href", "/upload");
    expect(upload).not.toHaveClass("bg-primary");
    expect(screen.getByRole("link", { name: "Settings" })).toHaveAttribute(
      "href",
      "/settings"
    );
  });
});
